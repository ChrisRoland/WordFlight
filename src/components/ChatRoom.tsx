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
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LucideRocket, Rocket, Menu } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  userName: string;
  roomId: string;
  createdAt: Timestamp | null;
}

interface ChatRoomProps {
  userName: string;
  roomId: string;
  roomName: string;
  onOpenSidebar?: () => void;
}

export default function ChatRoom({ userName, roomId, roomName, onOpenSidebar }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [formValue, setFormValue] = useState('');
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
      });
      
      setFormValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
            
            return (
              <div
                key={id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
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
                  <div className="break-words text-sm lg:text-base">
                    {text}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-1 ${
                    isMyMessage ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatTime(createdAt)}
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
    </div>
  );
}