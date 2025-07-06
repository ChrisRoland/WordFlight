import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ChatRoom from './ChatRoom';
import Sidebar from './Sidebar';
import { Rocket } from 'lucide-react';

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp | null;
}

interface ChatAppProps {
  userName: string;
}

export default function ChatApp({ userName }: ChatAppProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Subscribe to rooms
  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData: Room[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Room));
      
      setRooms(roomsData);
      
      // Set default room if none selected
      if (!currentRoomId && roomsData.length > 0) {
        setCurrentRoomId(roomsData[0].id);
      }
    });

    return () => unsubscribe();
  }, [currentRoomId]);

  // Create a new room
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || '',
        createdAt: serverTimestamp(),
      });
      
      setCurrentRoomId(docRef.id);
      setNewRoomName('');
      setNewRoomDescription('');
      setShowCreateRoom(false);
      setSidebarOpen(false); // Close sidebar on mobile after creating room
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    setCurrentRoomId(roomId);
    setSidebarOpen(false); // Close sidebar on mobile after selecting room
  };

  const currentRoom = rooms.find(room => room.id === currentRoomId);

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static z-50 transition-transform duration-300 ease-in-out`}>
        <Sidebar
          rooms={rooms}
          currentRoomId={currentRoomId}
          onRoomSelect={handleRoomSelect}
          onCreateRoom={() => setShowCreateRoom(true)}
          userName={userName}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {currentRoom ? (
          <ChatRoom 
            userName={userName} 
            roomId={currentRoomId}
            roomName={currentRoom.name}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-200 p-4">
            <div className="text-center max-w-sm">
              <div className="w-full flex justify-center mb-4">
                <Rocket className="text-green-500 size-12 lg:size-16"/>
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
            <h3 className="text-black text-lg font-semibold mb-4">Create New Room</h3>
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
                    setNewRoomName('');
                    setNewRoomDescription('');
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