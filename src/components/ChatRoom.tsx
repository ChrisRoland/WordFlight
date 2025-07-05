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
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Message {
  id: string;
  text: string;
  userName: string;
  createdAt: Timestamp | null;
}

interface ChatRoomProps {
  userName: string;
}

export default function ChatRoom({ userName }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [formValue, setFormValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to messages
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
      const msgs: Message[] = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      } as Message));
      setMessages(msgs);
      
      // scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    
    return () => unsubscribe();
  }, []);

  // Send a new message
  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formValue) return;

    await addDoc(collection(db, 'messages'), {
      text: formValue,
      createdAt: serverTimestamp(),
      userName,
    });
    
    setFormValue('');
  };

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto p-4">
      <div className="flex-1 text-black overflow-y-auto space-y-2 mb-4">
        {messages.map(({ id, text, userName }) => (
          <div key={id} className="px-3 py-2 bg-gray-100 rounded-lg">
            <span className="font-medium text-sm text-gray-700">{userName}:</span>{' '}
            <span>{text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      
      <form onSubmit={sendMessage} className="flex">
        <input
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none"
          value={formValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValue(e.target.value)}
          placeholder="Say something…"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}