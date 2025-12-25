'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
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
    const chatPartnerIds = new Set<string>();

    // Listen to sent messages
    const messagesQuery1 = query(
      collection(db, 'messages'),
      where('senderId', '==', user.uid)
    );

    // Listen to received messages
    const messagesQuery2 = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid)
    );

    const updateUsersList = async () => {
      const uniqueIds = Array.from(chatPartnerIds);
      const usersList: ChatUser[] = [];

      for (const userId of uniqueIds) {
        try {
          const userQuery = query(
            collection(db, 'users'),
            where('uid', '==', userId)
          );
          const userSnapshot = await getDocs(userQuery);
          
          userSnapshot.forEach((doc) => {
            const data = doc.data();
            usersList.push({
              uid: doc.id,
              email: data.email,
              displayName: data.displayName,
              photoURL: data.photoURL,
              lastSeen: data.lastSeen?.toDate() || new Date(),
            });
          });
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }

      setUsers(usersList);
    };

    const unsubscribe1 = onSnapshot(messagesQuery1, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.receiverId) {
          chatPartnerIds.add(data.receiverId);
        }
      });
      updateUsersList();
    });

    const unsubscribe2 = onSnapshot(messagesQuery2, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.senderId) {
          chatPartnerIds.add(data.senderId);
        }
      });
      updateUsersList();
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
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
