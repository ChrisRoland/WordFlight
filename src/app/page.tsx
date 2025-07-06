"use client"

import { useState } from 'react';
import Image from 'next/image';
import ChatApp from '../components/ChatApp';
import Logo from '/public/WFLogo.png';

export default function Home() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h1 className="flex flex-col items-center justify-center text-2xl font-bold text-center mb-6 text-gray-800">
            <Image src={Logo} alt='logo' className='size-20'/>
            Welcome to WordFlight
          </h1>
          <form
            onSubmit={e => { 
              e.preventDefault(); 
              if (name.trim()) setJoined(true); 
            }}
            className="space-y-4"
          >
            <input
              className="w-full text-black border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <button 
              type="submit"
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition duration-300"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <ChatApp userName={name} />;
}