'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { ChatUser } from './ChatInterface';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  or,
  and,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, Menu, Circle, Smile, Paperclip, Search, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  currentUser: User;
  selectedUser: ChatUser | null;
  onMenuClick: () => void;
}

interface MessageType {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  isRead?: boolean;
}

export default function ChatWindow({ currentUser, selectedUser, onMenuClick }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update user's last seen on mount and periodically
  useEffect(() => {
    const updateLastSeen = async () => {
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastSeen: serverTimestamp(),
        }, { merge: true });
      }
    };

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  // Listen to messages
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      or(
        and(
          where('senderId', '==', currentUser.uid),
          where('receiverId', '==', selectedUser.uid)
        ),
        and(
          where('senderId', '==', selectedUser.uid),
          where('receiverId', '==', currentUser.uid)
        )
      ),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList: MessageType[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          receiverId: data.receiverId,
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead || false,
        });
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [currentUser.uid, selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const isOnline = (user: ChatUser | null) => {
    if (!user) return false;
    const now = new Date();
    const diff = now.getTime() - user.lastSeen.getTime();
    return diff < 60000;
  };

  if (!selectedUser) {
    return (
      <div className="h-full bg-whatsapp-darker flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-whatsapp-light rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">
            WhatsApp Clone
          </h2>
          <p className="text-gray-500">
            Sohbete başlamak için soldaki listeden bir kişi seçin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-whatsapp-darker flex flex-col">
      {/* Chat Header */}
      <div className="bg-whatsapp-light border-b border-whatsapp-border">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-whatsapp-lighter rounded-full transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="relative">
            <img
              src={selectedUser.photoURL || '/default-avatar.png'}
              alt={selectedUser.displayName}
              className="w-10 h-10 rounded-full"
            />
            {isOnline(selectedUser) && (
              <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-green-500 bg-whatsapp-light rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate">
              {selectedUser.displayName}
            </h3>
            <p className="text-sm text-gray-400">
              {otherUserTyping ? (
                <span className="text-whatsapp-primary">yazıyor...</span>
              ) : isOnline(selectedUser) ? (
                <span className="text-green-500">Çevrimiçi</span>
              ) : (
                `Son görülme: ${format(selectedUser.lastSeen, 'HH:mm', { locale: tr })}`
              )}
            </p>
          </div>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-whatsapp-lighter rounded-full transition-colors"
            title="Mesajlarda Ara"
          >
            <Search className={`w-5 h-5 ${showSearch ? 'text-whatsapp-primary' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Search Input */}
        {showSearch && (
          <div className="px-4 pb-4 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mesajlarda ara..."
                className="w-full bg-whatsapp-darker text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary/50 placeholder-gray-500 text-sm"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 10h1v1h-1zM20 20h1v1h-1zM30 30h1v1h-1zM40 40h1v1h-1z" fill="%23ffffff" fill-opacity="0.02"/%3E%3C/svg%3E")',
      }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-whatsapp-light rounded-full flex items-center justify-center">
                <Send className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-500">Henüz mesaj yok</p>
              <p className="text-gray-600 text-sm mt-1">İlk mesajı gönderin!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUser.uid;
              const showDate = index === 0 || 
                format(filteredMessages[index - 1].timestamp, 'dd/MM/yyyy') !== format(message.timestamp, 'dd/MM/yyyy');

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="bg-whatsapp-light text-gray-400 text-xs px-3 py-1 rounded-lg">
                        {format(message.timestamp, 'dd MMMM yyyy', { locale: tr })}
                      </span>
                    </div>
                  )}
                  <Message
                    id={message.id}
                    text={message.text}
                    timestamp={message.timestamp}
                    isOwn={isOwn}
                    isRead={message.isRead}
                    currentUserId={currentUser.uid}
                  />
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {!searchQuery && otherUserTyping && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}
          </>
        );
        })()}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-whatsapp-light p-4 border-t border-whatsapp-border">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-whatsapp-lighter rounded-full transition-colors"
            title="Emoji"
          >
            <Smile className="w-6 h-6 text-gray-400" />
          </button>
          
          <button
            type="button"
            className="p-2 hover:bg-whatsapp-lighter rounded-full transition-colors"
            title="Dosya Ekle"
          >
            <Paperclip className="w-6 h-6 text-gray-400" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Bir mesaj yazın..."
            className="flex-1 bg-whatsapp-darker text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary/50 placeholder-gray-500"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-whatsapp-primary hover:bg-whatsapp-secondary disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
