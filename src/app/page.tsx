"use client"

import { useState } from 'react';
import ChatRoom from '../components/ChatRoom';

export default function Home() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <form
          onSubmit={e => { e.preventDefault(); setJoined(true); }}
          className="space-x-2"
        >
          <input
            className="border px-3 py-2 rounded"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return <ChatRoom userName={name} />;
}
