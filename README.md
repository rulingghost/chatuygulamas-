# Chat Uygulaması 💬

WhatsApp Web'e benzer, modern ve gerçek zamanlı bir mesajlaşma uygulaması.

## ✨ Özellikler

- 🔐 **Email/Şifre ile Giriş** - Kullanıcılar email ve şifre ile kayıt olup giriş yapabilir
- 💬 **Gerçek Zamanlı Mesajlaşma** - Firebase Firestore ile anlık mesajlaşma
- 📧 **Email ile Sohbet Başlatma** - Karşı tarafın email adresini girerek yeni sohbet başlatın
- 🟢 **Çevrimiçi Durum** - Kullanıcıların çevrimiçi/çevrimdışı durumunu görün
- 📱 **Responsive Tasarım** - Mobil ve masaüstü uyumlu
- 🎨 **Modern UI** - WhatsApp Web'den ilham alan karanlık tema
- ⚡ **Hızlı ve Güvenli** - Next.js 15 ve Firebase ile güçlendirilmiş

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Firebase Projesi Oluşturun

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. Yeni bir proje oluşturun
3. **Authentication** bölümünden **Email/Password** metodunu aktif edin
4. **Firestore Database** oluşturun (Test modunda başlatın)
5. Proje ayarlarından Firebase yapılandırma bilgilerinizi alın

### 3. Firestore Güvenlik Kuralları

Firebase Console'da Firestore > Rules bölümüne gidin ve aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.senderId == request.auth.uid;
    }
  }
}
```

### 4. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env.local` olarak kopyalayın ve Firebase bilgilerinizi girin:

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 5. Uygulamayı Çalıştırın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📦 Vercel'e Deploy

### 1. Vercel'e Giriş Yapın

```bash
npm install -g vercel
vercel login
```

### 2. Deploy Edin

```bash
vercel
```

### 3. Ortam Değişkenlerini Ekleyin

Vercel Dashboard'da projenize gidin:
1. Settings > Environment Variables
2. Tüm Firebase yapılandırma değişkenlerini ekleyin
3. Production, Preview ve Development için aktif edin

### 4. Production Deploy

```bash
vercel --prod
```

## 🎯 Kullanım

1. **Kayıt Olun**: Email ve şifre ile yeni hesap oluşturun
2. **Giriş Yapın**: Mevcut hesabınızla giriş yapın
3. **Yeni Sohbet**: Sağ üstteki **+** butonuna tıklayın
4. **Email Girin**: Sohbet etmek istediğiniz kişinin email adresini girin
5. **Mesajlaşın**: Gerçek zamanlı olarak mesajlaşmaya başlayın!

## 🛠️ Teknolojiler

- **Next.js 15** - React framework
- **TypeScript** - Tip güvenliği
- **Firebase Authentication** - Kullanıcı yönetimi
- **Firebase Firestore** - Gerçek zamanlı veritabanı
- **Tailwind CSS** - Stil yönetimi
- **Lucide React** - İkonlar
- **date-fns** - Tarih formatlama

## 📱 Ekran Görüntüleri

- **Giriş Sayfası**: Modern ve kullanıcı dostu giriş/kayıt formu
- **Sohbet Listesi**: Tüm sohbetlerinizi görün
- **Mesajlaşma**: WhatsApp Web benzeri mesajlaşma arayüzü
- **Yeni Sohbet**: Email ile kolayca yeni sohbet başlatın

## 🔒 Güvenlik

- Tüm mesajlar Firebase Firestore'da güvenli şekilde saklanır
- Kullanıcılar sadece kendi mesajlarını görebilir
- Firebase güvenlik kuralları ile korumalı
- Email/şifre ile güvenli kimlik doğrulama

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull request göndermekten çekinmeyin.

## 💡 İpuçları

- İlk kullanıcı olarak kayıt olun
- Başka bir tarayıcıda veya gizli modda ikinci bir hesap oluşturun
- İki hesap arasında mesajlaşmayı test edin
- Gerçek zamanlı güncellemeleri görün!

## 🐛 Sorun Giderme

**Mesajlar görünmüyor mu?**
- Firestore güvenlik kurallarını kontrol edin
- Her iki kullanıcının da giriş yapmış olduğundan emin olun

**Kullanıcı bulunamıyor mu?**
- Email adresinin doğru yazıldığından emin olun
- Kullanıcının kayıt olduğundan emin olun

**Çevrimiçi durum güncellenmiyor mu?**
- Sayfayı yenileyin
- İnternet bağlantınızı kontrol edin

---

**Keyifli Mesajlaşmalar! 🎉**
