'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Login from '@/components/Login';
import ChatInterface from '@/components/ChatInterface';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-whatsapp-darker flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-whatsapp-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-whatsapp-darker">
      {user ? <ChatInterface user={user} /> : <Login />}
    </main>
  );
}
