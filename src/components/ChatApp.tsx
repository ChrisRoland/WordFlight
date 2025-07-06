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
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const currentRoom = rooms.find(room => room.id === currentRoomId);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        rooms={rooms}
        currentRoomId={currentRoomId}
        onRoomSelect={setCurrentRoomId}
        onCreateRoom={() => setShowCreateRoom(true)}
        userName={userName}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <ChatRoom 
            userName={userName} 
            roomId={currentRoomId}
            roomName={currentRoom.name}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <div className="w-full flex justify-center mb-4 "><Rocket className="text-green-500 size-10"/></div>
              <h2 className="text-xl font-semibold text-gray-600 mb-4">
                No rooms available
              </h2>
              <p className="text-gray-500 mb-6">Create your first room to start chatting!</p>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300 font-medium"
              >
                Create First Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
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
                  className="w-full text-black border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full text-black border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
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