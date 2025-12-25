'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, Camera, User as UserIcon } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onClose: () => void;
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
      });
      alert('✅ Profil güncellendi!');
      onClose();
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      alert('❌ Profil güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async () => {
    const newName = prompt('Yeni isim girin (Avatar otomatik oluşturulacak):', displayName);
    if (!newName) return;

    const newPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=00a884&color=fff&size=200`;

    setLoading(true);
    try {
      await updateProfile(user, { photoURL: newPhotoURL, displayName: newName });
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: newPhotoURL,
        displayName: newName,
      });
      setDisplayName(newName);
      alert('✅ Avatar güncellendi!');
    } catch (error) {
      console.error('Avatar güncelleme hatası:', error);
      alert('❌ Avatar güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-whatsapp-light rounded-2xl p-6 max-w-md w-full animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Profil Ayarları</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-whatsapp-lighter rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt={user.displayName || 'User'}
              className="w-32 h-32 rounded-full border-4 border-whatsapp-primary"
            />
            <button
              onClick={handleAvatarChange}
              className="absolute bottom-0 right-0 p-3 bg-whatsapp-primary hover:bg-whatsapp-secondary rounded-full transition-colors shadow-lg"
              disabled={loading}
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">{user.email}</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              İsim Soyisim
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Adınız Soyadınız"
                className="w-full bg-whatsapp-darker text-white pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary/50 placeholder-gray-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="w-full bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary hover:from-whatsapp-secondary hover:to-whatsapp-primary text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}
