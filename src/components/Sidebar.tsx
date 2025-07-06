import Image from 'next/image';
import { Room } from './ChatApp';
import { X, MoreVertical, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from '/public/WFLogo.png';

interface SidebarProps {
  rooms: Room[];
  currentRoomId: string;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: () => void;
  onDeleteRoom: (roomId: string) => void;
  userName: string;
  onClose?: () => void;
}

export default function Sidebar({ 
  rooms, 
  currentRoomId, 
  onRoomSelect, 
  onCreateRoom, 
  onDeleteRoom,
  userName,
  onClose
}: SidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteRoom = (roomId: string) => {
    onDeleteRoom(roomId);
    setShowDeleteConfirm(null);
    setOpenMenuId(null);
  };

  return (
    <>
      <div className="w-80 lg:w-80 h-full bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="flex items-center text-lg lg:text-xl font-bold text-gray-800 gap-2">
              <Image src={Logo} alt='logo' className='size-8 lg:size-10'/>
              <span className="">WordFlight</span>
            </h1>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="size-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* User info - only show on larger screens or when there's space */}
        <div className="px-4 py-2 border-b border-gray-200">
          <p className="text-xs lg:text-sm text-gray-600 truncate">
            Welcome, {userName}
          </p>
        </div>

        {/* Create Room Button */}
        <div className="p-3 lg:p-4 border-b border-gray-200">
          <button
            onClick={onCreateRoom}
            className="w-full bg-green-500 text-white px-3 lg:px-4 py-2 lg:py-2 rounded-lg hover:bg-green-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-xs lg:text-sm font-medium transition duration-300"
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
              <div className="px-2 py-4 text-xs lg:text-sm text-gray-500 text-center">
                No rooms yet. Create one!
              </div>
            ) : (
              <div className="space-y-1 mt-2">
                {rooms.map((room) => (
                  <div key={room.id} className="relative group">
                    <button
                      onClick={() => onRoomSelect(room.id)}
                      className={`w-full text-left px-3 py-2 lg:py-3 rounded-lg transition-colors cursor-pointer pr-8 ${
                        currentRoomId === room.id
                          ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium text-xs lg:text-sm truncate">
                        # {room.name}
                      </div>
                      {room.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {room.description}
                        </div>
                      )}
                    </button>
                    
                    {/* Three dots menu */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === room.id ? null : room.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity"
                      >
                        <MoreVertical className="size-3 text-gray-500" />
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuId === room.id && (
                        <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(room.id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                          >
                            <Trash2 className="size-3" />
                            Delete Room
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs lg:text-sm text-gray-600">Online</span>
          </div>
        </div>
      </div>

      {/* Delete Room Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="size-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Room</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this room? All messages in this room will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRoom(showDeleteConfirm)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}