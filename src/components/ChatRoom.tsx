import { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
  Timestamp,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LucideRocket, Rocket, Menu, MoreVertical, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  userName: string;
  roomId: string;
  createdAt: Timestamp | null;
  roomCreator?: string;
}

interface ChatRoomProps {
  userName: string;
  roomId: string;
  roomName: string;
  roomCreator?: string;
  onOpenSidebar?: () => void;
}

export default function ChatRoom({ userName, roomId, roomName, roomCreator, onOpenSidebar }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [formValue, setFormValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to messages for current room
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
      const msgs: Message[] = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      } as Message));
      setMessages(msgs);
      
      // scroll to bottom
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    
    return () => unsubscribe();
  }, [roomId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Send a new message
  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formValue.trim() || !roomId) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: formValue.trim(),
        createdAt: serverTimestamp(),
        userName,
        roomId,
        roomCreator,
      });
      
      setFormValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
      setShowDeleteConfirm(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Check if user can delete message
  const canDeleteMessage = (message: Message) => {
    return message.userName === userName || roomCreator === userName;
  };

  // Format timestamp
  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-200">
      {/* Header */}
      <div className="bg-white border-b p-3 lg:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="size-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
                # {roomName}
              </h1>
              <p className="text-xs lg:text-sm text-gray-600 truncate">
                {messages.length === 0 
                  ? 'No messages yet. Start the conversation!' 
                  : `${messages.length} message${messages.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
          {/* User info on larger screens */}
          <div className="hidden lg:block">
            <p className="text-sm text-gray-600">
              Logged in as {userName}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 lg:space-y-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-full">
            <div className="text-center text-gray-500 max-w-sm px-4">
              <div className="w-full flex justify-center mb-2 lg:mb-4">
                <Rocket className="size-8 lg:size-12 text-gray-400"/>
              </div>
              <p className="text-base lg:text-lg font-medium mb-1 lg:mb-2">
                Welcome to #{roomName}!
              </p>
              <p className="text-sm lg:text-base">
                Grant your words flight and start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map(({ id, text, userName: messageUserName, createdAt }) => {
            const isMyMessage = messageUserName === userName;
            const canDelete = canDeleteMessage({ id, text, userName: messageUserName, roomId, createdAt, roomCreator });
            
            return (
              <div
                key={id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group`}
              >
                <div className="relative">
                  <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 lg:px-4 py-2 rounded-lg ${
                    isMyMessage 
                      ? 'bg-green-500 text-white' 
                      : 'bg-purple-300 text-gray-800 border border-gray-200'
                  }`}>
                    {/* Username (only show for other users) */}
                    {!isMyMessage && (
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {messageUserName}
                      </div>
                    )}
                    
                    {/* Message text */}
                    <div className="break-words text-sm lg:text-base pr-6">
                      {text}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-xs mt-1 ${
                      isMyMessage ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {formatTime(createdAt)}
                    </div>

                    {/* Three dots menu */}
                    {canDelete && (
                      <div className="absolute top-1 right-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === id ? null : id);
                          }}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                            isMyMessage ? 'hover:bg-green-600' : 'hover:bg-purple-400'
                          }`}
                        >
                          <MoreVertical className="size-3" />
                        </button>
                        
                        {/* Dropdown menu */}
                        {openMenuId === id && (
                          <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(id);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="size-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      
      {/* Input form */}
      <div className="bg-white border-t p-3 lg:p-4 safe-area-padding-bottom">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            className="flex-1 border text-black border-gray-300 rounded-full px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base"
            value={formValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValue(e.target.value)}
            placeholder={`Grant your words flight to #${roomName}…`}
          />
          <button
            type="submit"
            className="flex items-center justify-center bg-green-500 text-white font-bold px-4 lg:px-6 py-2 lg:py-3 rounded-full hover:bg-green-600 transition duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 min-w-[44px]"
            disabled={!formValue.trim()}
          >
            <LucideRocket className="size-4 lg:size-5"/>
          </button>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="size-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Message</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMessage(showDeleteConfirm)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}