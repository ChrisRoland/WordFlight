import Image from 'next/image';
import { Room, UnreadCount } from './ChatApp';
import { X, MoreVertical, Trash2, Bell, BellOff, Volume2, VolumeX, Settings } from 'lucide-react';
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
  unreadCounts: UnreadCount;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  onToggleNotifications: () => void;
  onToggleSound: () => void;
}

// Utility function to generate avatar colors based on username
const getAvatarColor = (userName: string) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500'
  ];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from username
const getInitials = (userName: string) => {
  return userName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Avatar component
const Avatar = ({ userName, size = 'md' }: { userName: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
  
  return (
    <div className={`${sizeClasses[size]} ${getAvatarColor(userName)} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}>
      {getInitials(userName)}
    </div>
  );
};

// Unread badge component
const UnreadBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  
  return (
    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default function Sidebar({ 
  rooms, 
  currentRoomId, 
  onRoomSelect, 
  onCreateRoom, 
  onDeleteRoom,
  userName,
  onClose,
  unreadCounts,
  notificationsEnabled,
  soundEnabled,
  onToggleNotifications,
  onToggleSound
}: SidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.room-menu') && !target.closest('.notification-settings')) {
        setOpenMenuId(null);
        setShowNotificationSettings(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Clean up long press timer
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  const handleDeleteRoom = (roomId: string) => {
    onDeleteRoom(roomId);
    setShowDeleteConfirm(null);
    setOpenMenuId(null);
  };

  // Handle long press for mobile
  const handleTouchStart = (roomId: string) => {
    const timer = setTimeout(() => {
      setOpenMenuId(roomId);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Handle room click - prevent if menu is open
  const handleRoomClick = (roomId: string, e: React.MouseEvent) => {
    // If clicking on the menu button or menu, don't select the room
    const target = e.target as HTMLElement;
    if (target.closest('.room-menu')) {
      return;
    }
    
    // Only select room if menu isn't open
    if (!openMenuId) {
      onRoomSelect(roomId);
    }
  };

  // Calculate total unread count
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <div className="w-80 lg:w-80 h-screen bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="flex items-center text-lg lg:text-xl font-bold text-gray-800 gap-2">
              <Image src={Logo} alt='logo' className='size-8 lg:size-10'/>
              <span className="">WordFlight</span>
              {totalUnreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-medium ml-1">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </div>
              )}
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

        {/* User info with avatar and notification settings */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar userName={userName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500">
                  Online
                </p>
              </div>
            </div>
            
            {/* Notification settings button */}
            <div className="relative notification-settings">
              <button
                onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="size-4 text-gray-500" />
              </button>
              
              {/* Notification settings dropdown */}
              {showNotificationSettings && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px]">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={onToggleNotifications}
                      className="w-full flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 text-sm"
                    >
                      {notificationsEnabled ? (
                        <Bell className="size-4 text-green-500" />
                      ) : (
                        <BellOff className="size-4 text-red-500" />
                      )}
                      <span className="text-gray-700">
                        {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                      </span>
                    </button>
                    
                    <button
                      onClick={onToggleSound}
                      className="w-full flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 text-sm"
                    >
                      {soundEnabled ? (
                        <Volume2 className="size-4 text-green-500" />
                      ) : (
                        <VolumeX className="size-4 text-red-500" />
                      )}
                      <span className="text-gray-700">
                        {soundEnabled ? 'Sound On' : 'Sound Off'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
                {rooms.map((room) => {
                  const unreadCount = unreadCounts[room.id] || 0;
                  const isCurrentRoom = currentRoomId === room.id;
                  
                  return (
                    <div key={room.id} className="relative group">
                      <button
                        onClick={(e) => handleRoomClick(room.id, e)}
                        onTouchStart={() => handleTouchStart(room.id)}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                        className={`w-full text-left px-3 py-2 lg:py-3 rounded-lg transition-colors cursor-pointer pr-8 relative ${
                          isCurrentRoom
                            ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                            : unreadCount > 0
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-xs lg:text-sm truncate ${
                              unreadCount > 0 && !isCurrentRoom ? 'font-bold' : ''
                            }`}>
                              # {room.name}
                            </div>
                            {room.description && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {room.description}
                              </div>
                            )}
                            {room.createdBy && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Avatar userName={room.createdBy} size="sm" />
                                <span className="text-xs text-gray-400 truncate">
                                  by {room.createdBy}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Unread badge */}
                          {unreadCount > 0 && !isCurrentRoom && (
                            <div className="ml-2">
                              <UnreadBadge count={unreadCount} />
                            </div>
                          )}
                        </div>
                      </button>
                      
                      {/* Three dots menu */}
                      <div className="absolute top-2 right-2 room-menu">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setOpenMenuId(openMenuId === room.id ? null : room.id);
                          }}
                          className="lg:opacity-0 lg:group-hover:opacity-100 opacity-100 p-1 rounded cursor-pointer hover:bg-gray-200 transition-opacity"
                        >
                          <MoreVertical className="size-3 text-gray-500" />
                        </button>
                        
                        {/* Dropdown menu */}
                        {openMenuId === room.id && (
                          <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowDeleteConfirm(room.id);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 cursor-pointer hover:bg-red-50 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="size-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer with notification status */}
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs lg:text-sm text-gray-600">Online</span>
            </div>
            
            {/* Quick notification toggles */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onToggleNotifications}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
              >
                {notificationsEnabled ? (
                  <Bell className="size-3 text-green-500" />
                ) : (
                  <BellOff className="size-3 text-gray-400" />
                )}
              </button>
              
              <button
                onClick={onToggleSound}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                {soundEnabled ? (
                  <Volume2 className="size-3 text-green-500" />
                ) : (
                  <VolumeX className="size-3 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Room Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/75 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}