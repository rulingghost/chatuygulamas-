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
    <div className="h-screen flex overflow-hidden bg-whatsapp-dark">
      {/* Sidebar/Chat List - Show when no user selected on mobile */}
      <div className={`
        ${selectedUser ? 'hidden md:block' : 'block'}
        w-full md:w-96
        h-full
        bg-whatsapp-dark
      `}>
        <Sidebar
          currentUser={user}
          users={users}
          selectedUser={selectedUser}
          onSelectUser={(user) => {
            setSelectedUser(user);
          }}
          onClose={() => setSelectedUser(null)}
        />
      </div>

      {/* Chat Window - Show when user selected */}
      {selectedUser && (
        <div className="flex-1 w-full h-full bg-whatsapp-dark">
          <ChatWindow
            currentUser={user}
            selectedUser={selectedUser}
            onMenuClick={() => setSelectedUser(null)}
          />
        </div>
      )}
      
      {/* Empty state on desktop when no chat selected */}
      {!selectedUser && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-whatsapp-darker">
          <div className="text-center">
            <div className="w-64 h-64 mx-auto mb-8 opacity-10">
              <svg viewBox="0 0 303 172" fill="currentColor" className="text-gray-600">
                <path d="M151.5 0C67.9 0 0 67.9 0 151.5S67.9 303 151.5 303 303 235.1 303 151.5 235.1 0 151.5 0zm0 276.9c-69.3 0-125.4-56.1-125.4-125.4S82.2 26.1 151.5 26.1s125.4 56.1 125.4 125.4-56.1 125.4-125.4 125.4z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-light text-gray-400 mb-4">Chat App</h2>
            <p className="text-gray-500">Bir sohbet seçin ve mesajlaşmaya başlayın</p>
          </div>
        </div>
      )}
    </div>
  );
}
