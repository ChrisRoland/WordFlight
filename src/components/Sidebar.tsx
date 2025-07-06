import Image from 'next/image';
import { Room } from './ChatApp';
import Logo from '/public/WFLogo.png';

interface SidebarProps {
  rooms: Room[];
  currentRoomId: string;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: () => void;
  userName: string;
}

export default function Sidebar({ 
  rooms, 
  currentRoomId, 
  onRoomSelect, 
  onCreateRoom, 
  userName 
}: SidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="flex items-center text-xl font-bold text-gray-800"><Image src={Logo} alt='logo' className='size-10'/> WordFlight</h1>
        <p className="text-sm text-gray-600">Welcome, {userName}</p>
      </div>

      {/* Create Room Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateRoom}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium transition duration-300"
        >
          + Create New Room
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h2 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Chat Rooms
          </h2>
          {rooms.length === 0 ? (
            <div className="px-2 py-4 text-sm text-gray-500 text-center">
              No rooms yet. Create one!
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onRoomSelect(room.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    currentRoomId === room.id
                      ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm"># {room.name}</div>
                  {room.description && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {room.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Online</span>
        </div>
      </div>
    </div>
  );
}