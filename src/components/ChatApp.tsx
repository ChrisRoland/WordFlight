import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  doc,
  where,
  getDocs,
  writeBatch,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import ChatRoom from "./ChatRoom";
import Sidebar from "./Sidebar";
import { Rocket, Bell } from "lucide-react";
// , BellOff, Volume2, VolumeX

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp | null;
  createdBy?: string;
}

export interface UnreadCount {
  [roomId: string]: number;
}

interface ChatAppProps {
  userName: string;
}

// Notification sound utility
const playNotificationSound = () => {
  try {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // You can change these for different sounds:
    // oscillator.type: "sine", "square", "triangle", "sawtooth"
    // oscillator.frequency.value: pitch in Hz (e.g. 440 = A4)
    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn("Could not play notification sound:", error);
  }
};

// Toast notification component
const ToastNotification = ({
  message,
  roomName,
  onClose,
  onClick,
}: {
  message: string;
  roomName: string;
  onClose: () => void;
  onClick: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-hide after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Bell className="size-5 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            New message in #{roomName}
          </p>
          <p className="text-sm text-gray-600 truncate">{message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function ChatApp({ userName }: ChatAppProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(true);

  // Notification states
  const [unreadCounts, setUnreadCounts] = useState<UnreadCount>({});
  const [lastSeenTimestamps, setLastSeenTimestamps] = useState<{
    [roomId: string]: Timestamp;
  }>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    roomName: string;
    roomId: string;
  } | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Update document title with unread count
  useEffect(() => {
    const baseTitle = "WordFlight";
    document.title =
      totalUnreadCount > 0 ? `(${totalUnreadCount}) ${baseTitle}` : baseTitle;
  }, [totalUnreadCount]);

  // Calculate total unread count
  useEffect(() => {
    const total = Object.values(unreadCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    setTotalUnreadCount(total);
  }, [unreadCounts]);

  // Track app visibility for notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsAppVisible(visible);

      // Mark current room as read when app becomes visible
      if (visible && currentRoomId) {
        markRoomAsRead(currentRoomId);
      }
    };

    const handleFocus = () => {
      setIsAppVisible(true);
      if (currentRoomId) {
        markRoomAsRead(currentRoomId);
      }
    };

    const handleBlur = () => {
      setIsAppVisible(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [currentRoomId]);

  // Mark room as read and update last seen timestamp
  const markRoomAsRead = (roomId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: 0,
    }));
    setLastSeenTimestamps((prev) => ({
      ...prev,
      [roomId]: Timestamp.now(),
    }));
  };

  // Subscribe to rooms
  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roomsData: Room[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Room)
        );

        setRooms(roomsData);

        // Set default room if none selected
        if (!currentRoomId && roomsData.length > 0) {
          setCurrentRoomId(roomsData[0].id);
        }

        // If current room was deleted, switch to first available room
        if (
          currentRoomId &&
          !roomsData.find((room) => room.id === currentRoomId)
        ) {
          setCurrentRoomId(roomsData.length > 0 ? roomsData[0].id : "");
        }
      },
      (error) => {
        console.error("Error fetching rooms:", error);
      }
    );

    return () => unsubscribe();
  }, [currentRoomId]);

  // Subscribe to new messages for notification system
  useEffect(() => {
    if (rooms.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    rooms.forEach((room) => {
      const q = query(
        collection(db, "messages"),
        where("roomId", "==", room.id),
        orderBy("createdAt", "desc"),
        limit(1) // Only get the latest message for each room
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            interface Message {
              id: string;
              text: string;
              userName: string;
              createdAt: Timestamp;
              roomId: string;
            }
            const messageData: Message = {
              id: change.doc.id,
              ...(change.doc.data() as Omit<Message, "id">),
            };

            // Only process if it's a new message (not initial load) and not from current user
            if (messageData.userName !== userName) {
              const messageTime = messageData.createdAt;
              const lastSeen = lastSeenTimestamps[room.id];

              // Check if this is a truly new message
              if (
                !lastSeen ||
                (messageTime && messageTime.toMillis() > lastSeen.toMillis())
              ) {
                // Increment unread count for non-current rooms
                if (room.id !== currentRoomId || !isAppVisible) {
                  setUnreadCounts((prev) => ({
                    ...prev,
                    [room.id]: (prev[room.id] || 0) + 1,
                  }));

                  // Show toast notification if not in the room or app not visible
                  if (
                    notificationsEnabled &&
                    (room.id !== currentRoomId || !isAppVisible)
                  ) {
                    setToastNotification({
                      message: messageData.text,
                      roomName: room.name,
                      roomId: room.id,
                    });

                    // Play sound if enabled
                    if (soundEnabled) {
                      playNotificationSound();
                    }

                    // Show browser notification if supported and permission granted
                    if (
                      "Notification" in window &&
                      Notification.permission === "granted"
                    ) {
                      new Notification(`New message in #${room.name}`, {
                        body: `${messageData.userName}: ${messageData.text}`,
                        icon: "/WFLogo.png",
                        tag: room.id, // Prevents multiple notifications for same room
                      });
                    }
                  }
                }
              }
            }
          }
        });
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    rooms,
    currentRoomId,
    isAppVisible,
    userName,
    lastSeenTimestamps,
    notificationsEnabled,
    soundEnabled,
  ]);

  // Request notification permission on first load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Mark current room as read when switching rooms
  useEffect(() => {
    if (currentRoomId && isAppVisible) {
      markRoomAsRead(currentRoomId);
    }
  }, [currentRoomId, isAppVisible]);

  // Create a new room
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "rooms"), {
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || "",
        createdAt: serverTimestamp(),
        createdBy: userName,
      });

      setCurrentRoomId(docRef.id);
      setNewRoomName("");
      setNewRoomDescription("");
      setShowCreateRoom(false);
      setSidebarOpen(false);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  // Delete a room and all its messages using batch operations
  const deleteRoom = async (roomId: string) => {
    try {
      const batch = writeBatch(db);

      const messagesQuery = query(
        collection(db, "messages"),
        where("roomId", "==", roomId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      messagesSnapshot.docs.forEach((messageDoc) => {
        batch.delete(doc(db, "messages", messageDoc.id));
      });

      batch.delete(doc(db, "rooms", roomId));
      await batch.commit();

      // Clean up notification states for deleted room
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[roomId];
        return newCounts;
      });

      setLastSeenTimestamps((prev) => {
        const newTimestamps = { ...prev };
        delete newTimestamps[roomId];
        return newTimestamps;
      });

      if (currentRoomId === roomId) {
        setCurrentRoomId("");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    setCurrentRoomId(roomId);
    setSidebarOpen(false);
    markRoomAsRead(roomId); // Mark as read when entering room
  };

  // Handle toast notification click
  const handleToastClick = () => {
    if (toastNotification) {
      setCurrentRoomId(toastNotification.roomId);
      setSidebarOpen(false);
      setToastNotification(null);
    }
  };

  const currentRoom = rooms.find((room) => room.id === currentRoomId);

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Toast Notification */}
      {toastNotification && (
        <ToastNotification
          message={toastNotification.message}
          roomName={toastNotification.roomName}
          onClose={() => setToastNotification(null)}
          onClick={handleToastClick}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static z-50 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar
          rooms={rooms}
          currentRoomId={currentRoomId}
          onRoomSelect={handleRoomSelect}
          onCreateRoom={() => setShowCreateRoom(true)}
          onDeleteRoom={deleteRoom}
          userName={userName}
          onClose={() => setSidebarOpen(false)}
          unreadCounts={unreadCounts}
          notificationsEnabled={notificationsEnabled}
          soundEnabled={soundEnabled}
          onToggleNotifications={() =>
            setNotificationsEnabled(!notificationsEnabled)
          }
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {currentRoom ? (
          isAppVisible ? (
            <ChatRoom
              userName={userName}
              roomId={currentRoomId}
              roomName={currentRoom.name}
              roomCreator={currentRoom.createdBy}
              onOpenSidebar={() => setSidebarOpen(true)}
              onNewMessage={() => {
                // Mark room as read when user sends a message
                markRoomAsRead(currentRoomId);
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-200 p-4">
              <div className="text-center text-gray-500">
                <Rocket className="size-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">App paused</p>
                <p className="text-sm">Switch back to continue chatting</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-200 p-4">
            <div className="text-center max-w-sm">
              <div className="w-full flex justify-center mb-4">
                <Rocket className="text-green-500 size-12 lg:size-16" />
              </div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-600 mb-2 lg:mb-4">
                No rooms available
              </h2>
              <p className="text-gray-500 mb-4 lg:mb-6 text-sm lg:text-base">
                Create your first room to start chatting!
              </p>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="bg-green-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-green-600 cursor-pointer transition duration-300 font-medium text-sm lg:text-base"
              >
                Create First Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-black text-lg font-semibold mb-4">
              Create New Room
            </h3>
            <form onSubmit={createRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full text-black border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  placeholder="Enter room name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  className="w-full text-black border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-base"
                  placeholder="Enter room description"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRoom(false);
                    setNewRoomName("");
                    setNewRoomDescription("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 lg:py-3 rounded-lg hover:bg-gray-400 transition duration-300 text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white px-4 py-2 lg:py-3 rounded-lg hover:bg-green-600 cursor-pointer transition duration-300 text-sm lg:text-base"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
