'use client';

import { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ChatUser } from './ChatInterface';
import { Search, LogOut, X, MessageCircle, Circle, Plus, Mail } from 'lucide-react';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SidebarProps {
  currentUser: User;
  users: ChatUser[];
  selectedUser: ChatUser | null;
  onSelectUser: (user: ChatUser) => void;
  onClose: () => void;
}

export default function Sidebar({ currentUser, users, selectedUser, onSelectUser, onClose }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      // Update last seen before signing out
      await setDoc(doc(db, 'users', currentUser.uid), {
        lastSeen: serverTimestamp(),
      }, { merge: true });
      
      await signOut(auth);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatEmail.trim()) {
      alert('Lütfen bir email adresi girin');
      return;
    }

    if (newChatEmail.toLowerCase() === currentUser.email?.toLowerCase()) {
      alert('Kendinizle sohbet edemezsiniz');
      return;
    }

    setLoading(true);
    try {
      // Search for user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', newChatEmail.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Bu email adresine sahip kullanıcı bulunamadı. Kullanıcının kayıt olduğundan emin olun.');
        setLoading(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const chatUser: ChatUser = {
        uid: querySnapshot.docs[0].id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        lastSeen: userData.lastSeen?.toDate() || new Date(),
      };

      onSelectUser(chatUser);
      setShowNewChatModal(false);
      setNewChatEmail('');
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      alert('Kullanıcı aranırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOnline = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    return diff < 60000; // Online if last seen within 1 minute
  };

  return (
    <>
      <div className="h-full bg-whatsapp-dark border-r border-whatsapp-border flex flex-col">
        {/* Header */}
        <div className="bg-whatsapp-light p-4 border-b border-whatsapp-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=00a884&color=fff&size=200`}
                alt={currentUser.displayName || 'User'}
                className="w-12 h-12 rounded-full border-2 border-whatsapp-primary"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-semibold truncate">
                  {currentUser.displayName}
                </h2>
                <p className="text-gray-400 text-sm truncate">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="md:hidden p-2 hover:bg-whatsapp-lighter rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 hover:bg-whatsapp-lighter rounded-full transition-colors group"
                title="Yeni Sohbet"
              >
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-whatsapp-primary transition-colors" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-whatsapp-lighter rounded-full transition-colors group"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Kişi veya sohbet ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-whatsapp-darker text-white pl-11 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary/50 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg font-medium mb-2">
                {searchQuery ? 'Kullanıcı bulunamadı' : 'Henüz sohbet yok'}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery ? 'Farklı bir arama deneyin' : 'Yeni sohbet başlatmak için + butonuna tıklayın'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="bg-whatsapp-primary hover:bg-whatsapp-secondary text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Sohbet
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-whatsapp-border">
              {filteredUsers.map((user) => {
                const online = isOnline(user.lastSeen);
                return (
                  <button
                    key={user.uid}
                    onClick={() => onSelectUser(user)}
                    className={`w-full p-4 hover:bg-whatsapp-lighter transition-colors text-left flex items-center gap-3 ${
                      selectedUser?.uid === user.uid ? 'bg-whatsapp-lighter' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=00a884&color=fff&size=200`}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                      {online && (
                        <Circle className="absolute bottom-0 right-0 w-3.5 h-3.5 text-green-500 fill-green-500 bg-whatsapp-dark rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-medium truncate">
                          {user.displayName}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDistanceToNow(user.lastSeen, { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm truncate flex items-center gap-2">
                        {online && <span className="text-green-500 text-xs">● Çevrimiçi</span>}
                        {!online && user.email}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-whatsapp-light rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Mail className="w-6 h-6 text-whatsapp-primary" />
                Yeni Sohbet Başlat
              </h3>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatEmail('');
                }}
                className="p-2 hover:bg-whatsapp-lighter rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleStartNewChat}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Kullanıcının Email Adresi
                </label>
                <input
                  type="email"
                  value={newChatEmail}
                  onChange={(e) => setNewChatEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full bg-whatsapp-darker text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary/50 placeholder-gray-500"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Sohbet etmek istediğiniz kişinin email adresini girin
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatModal(false);
                    setNewChatEmail('');
                  }}
                  className="flex-1 bg-whatsapp-darker hover:bg-whatsapp-border text-white py-3 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-whatsapp-primary hover:bg-whatsapp-secondary disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Aranıyor...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Sohbet Başlat
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
