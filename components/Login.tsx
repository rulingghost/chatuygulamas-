'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { MessageCircle, Mail, Lock, User, Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00a884&color=fff&size=200`,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        emailVerified: false,
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Sign out until email is verified
      await auth.signOut();
      
      alert('✅ Kayıt başarılı! Lütfen email adresinizi kontrol edin ve doğrulama linkine tıklayın. Doğruladıktan sonra giriş yapabilirsiniz.');
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Bu email adresi zaten kullanımda');
      } else if (error.code === 'auth/weak-password') {
        alert('Şifre en az 6 karakter olmalıdır');
      } else {
        alert('Kayıt olurken bir hata oluştu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Lütfen email ve şifre girin');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        alert('⚠️ Lütfen önce email adresinizi doğrulayın! Email kutunuzu kontrol edin ve doğrulama linkine tıklayın.');
        return;
      }
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert('Email veya şifre hatalı');
      } else if (error.code === 'auth/invalid-credential') {
        alert('Geçersiz giriş bilgileri');
      } else {
        alert('Giriş yapılırken bir hata oluştu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-whatsapp-primary/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-whatsapp-secondary/10 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-whatsapp-primary to-whatsapp-secondary rounded-full mb-6 shadow-2xl shadow-whatsapp-primary/30">
            <MessageCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-bold mb-3 gradient-text">
            Chat App
          </h1>
          <p className="text-gray-400 text-lg">
            Email ile giriş yapın ve sohbet edin
          </p>
        </div>

        {/* Login/Signup Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-whatsapp-border animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-whatsapp-primary" />
              {isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}
            </h2>
            <p className="text-gray-400">
              {isSignUp ? 'Yeni hesap oluşturun' : 'Hesabınıza giriş yapın'}
            </p>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  İsim Soyisim
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full bg-whatsapp-darker text-white pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary/50 placeholder-gray-500"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full bg-whatsapp-darker text-white pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary/50 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-whatsapp-darker text-white pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary/50 placeholder-gray-500"
                  required
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary hover:from-whatsapp-secondary hover:to-whatsapp-primary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-whatsapp-primary/30 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-lg">İşleniyor...</span>
                </>
              ) : (
                <>
                  {isSignUp ? (
                    <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  )}
                  <span className="text-lg">{isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                setDisplayName('');
              }}
              className="text-whatsapp-primary hover:text-whatsapp-secondary transition-colors"
            >
              {isSignUp ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-whatsapp-border">
            <div className="flex items-start gap-3 text-sm text-gray-500">
              <div className="w-1.5 h-1.5 bg-whatsapp-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Mesajlarınız güvenli bir şekilde Firebase'de saklanır.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🔒', text: 'Güvenli' },
            { icon: '⚡', text: 'Hızlı' },
            { icon: '🌐', text: 'Gerçek Zamanlı' }
          ].map((feature, index) => (
            <div
              key={index}
              className="glass rounded-xl p-4 border border-whatsapp-border hover:border-whatsapp-primary transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="text-sm text-gray-400">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
