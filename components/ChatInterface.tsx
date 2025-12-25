'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

interface ChatInterfaceProps {
  user: User;
}

export interface ChatUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastSeen: Date;
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Listen to all users
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('lastSeen', 'desc')
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersList: ChatUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== user.uid) {
          usersList.push({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            lastSeen: data.lastSeen?.toDate() || new Date(),
          });
        }
      });
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:relative
        z-30 md:z-0
        w-full md:w-96
        h-full
        transition-transform duration-300
      `}>
        <Sidebar
          currentUser={user}
          users={users}
          selectedUser={selectedUser}
          onSelectUser={(user) => {
            setSelectedUser(user);
            setIsMobileMenuOpen(false);
          }}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          currentUser={user}
          selectedUser={selectedUser}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
