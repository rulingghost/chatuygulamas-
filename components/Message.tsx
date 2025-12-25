'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Trash2, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MessageProps {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isRead?: boolean;
  currentUserId: string;
}

export default function Message({ id, text, timestamp, isOwn, isRead, currentUserId }: MessageProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      alert('Mesaj silinemedi');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter group`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="relative max-w-[85%] md:max-w-[75%]">
        <div
          className={`px-4 py-2 rounded-lg shadow-lg transition-all ${
            isOwn
              ? 'bg-whatsapp-outgoing text-white rounded-br-none'
              : 'bg-whatsapp-incoming text-white rounded-bl-none'
          } ${deleting ? 'opacity-50' : ''}`}
        >
          <p className="break-words whitespace-pre-wrap text-[15px] leading-relaxed">{text}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs text-gray-300">
              {format(timestamp, 'HH:mm', { locale: tr })}
            </span>
            {isOwn && (
              <span className="ml-1">
                {isRead ? (
                  <CheckCheck className="w-4 h-4 text-blue-400" />
                ) : (
                  <Check className="w-4 h-4 text-gray-300" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        {isOwn && showDelete && !deleting && (
          <button
            onClick={handleDelete}
            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title="Mesajı Sil"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
