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
import { LucideRocket, Rocket } from 'lucide-react';

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
}

export default function ChatRoom({ userName, roomId, roomName }: ChatRoomProps) {
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
      <div className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800"># {roomName}</h1>
        <p className="text-sm text-gray-600">
          {messages.length === 0 
            ? 'No messages yet. Start the conversation!' 
            : `${messages.length} message${messages.length !== 1 ? 's' : ''} • Logged in as ${userName}`
          }
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-full flex justify-center mb-2"><Rocket/></div>
              <p className="text-lg font-medium">Welcome to #{roomName}!</p>
              <p className="text-sm">Grant your words flight and start the conversation</p>
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
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
                  <div className="break-words">
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
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            className="flex-1 border text-black border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={formValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValue(e.target.value)}
            placeholder={`Grant your words flight to #${roomName}…`}
          />
          <button
            type="submit"
            className="flex gap-2 bg-green-500 text-white font-bold px-6 py-2 rounded-full hover:bg-green-600 transition duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={!formValue.trim()}
          >
            <LucideRocket/>
          </button>
        </form>
      </div>
    </div>
  );
}