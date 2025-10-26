# 🚀 Edirne Rota - Frontend Developer Guide

## 📌 API Base URL
```
Development: http://localhost:3000/api
Production: [PRODUCTION_URL]/api
```

---

## 🔐 Authentication Endpoints

### 1. Register (Kayıt Ol)

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "full_name": "Ahmet Yılmaz",
  "email": "ahmet@edirne.com",
  "password": "gucluSifre123"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Kullanıcı oluşturuldu",
  "user": {
    "id": 1,
    "full_name": "Ahmet Yılmaz",
    "email": "ahmet@edirne.com"
  }
}
```

**Error Response (409 - Email zaten kayıtlı):**
```json
{
  "status": "error",
  "message": "Bu e-posta zaten kullanılıyor"
}
```

**Error Response (400 - Validation hatası):**
```json
{
  "status": "error",
  "errors": [
    {
      "msg": "Ad soyad en az 2 karakter olmalı",
      "param": "full_name"
    },
    {
      "msg": "Geçerli bir e-posta girin",
      "param": "email"
    },
    {
      "msg": "Şifre en az 6 karakter olmalı",
      "param": "password"
    }
  ]
}
```

**Validasyon Kuralları:**
- `full_name`: Minimum 2 karakter
- `email`: Geçerli email formatı
- `password`: Minimum 6 karakter

---

### 2. Login (Giriş Yap)

**Endpoint:** `POST /auth/login`

**Rate Limit:** 6 istek / dakika (IP başına)

**Request Body:**
```json
{
  "email": "ahmet@edirne.com",
  "password": "gucluSifre123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Giriş başarılı",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "Ahmet Yılmaz",
    "email": "ahmet@edirne.com"
  }
}
```

**Error Response (401 - Geçersiz kimlik):**
```json
{
  "status": "error",
  "message": "Geçersiz kimlik bilgileri"
}
```

**Error Response (429 - Rate limit):**
```json
{
  "status": "error",
  "message": "Çok fazla giriş denemesi, lütfen bir dakika sonra tekrar deneyin"
}
```

**Token Kullanımı:**
- Token'ı `localStorage` veya `sessionStorage`'da sakla
- Her korumalı endpoint'e `Authorization: Bearer {token}` header'ı ile gönder
- Token geçerlilik süresi: 7 gün

---

### 3. Get Profile (Profil Bilgisi)

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "full_name": "Ahmet Yılmaz",
    "email": "ahmet@edirne.com"
  }
}
```

**Error Response (401 - Token yok/geçersiz):**
```json
{
  "status": "error",
  "message": "Token gerekli"
}
```

---

## 🔑 Password Reset Endpoints

### 4. Forgot Password (Şifremi Unuttum)

**Endpoint:** `POST /auth/forgot-password`

**Rate Limit:** 3 istek / 15 dakika (IP başına)

**Request Body:**
```json
{
  "email": "ahmet@edirne.com"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Eğer hesabınız varsa, şifre sıfırlama bağlantısı e-posta adresinize gönderildi"
}
```

**Development Response (200 - NODE_ENV !== production):**
```json
{
  "status": "success",
  "message": "Eğer hesabınız varsa, şifre sıfırlama bağlantısı e-posta adresinize gönderildi",
  "resetLink": "http://localhost:3000/reset-password?token=abc123..."
}
```

**Error Response (429 - Rate limit):**
```json
{
  "status": "error",
  "message": "Çok fazla şifre sıfırlama talebi, lütfen 15 dakika sonra tekrar deneyin"
}
```

**Not:** 
- Email kayıtlı olsun veya olmasın, aynı mesaj döner (güvenlik)
- Production'da `resetLink` dönmez, sadece email gönderilir
- Development'da test için `resetLink` response'da gelir

---

### 5. Reset Password (Yeni Şifre Belirle)

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "yeniGucluSifre789"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Şifreniz başarıyla güncellendi"
}
```

**Error Response (400 - Token geçersiz/süresi dolmuş):**
```json
{
  "status": "error",
  "message": "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı"
}
```

**Validasyon Kuralları:**
- `token`: Zorunlu
- `newPassword`: Minimum 6 karakter

**Token Geçerlilik:**
- Süre: 1 saat
- Tek kullanımlık (kullanıldıktan sonra geçersiz)

---

## 📱 Frontend Kullanım Örnekleri

### React/Vue/Vanilla JS - Register

```javascript
async function register(fullName, email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Kayıt başarılı:', data.user);
      // Kullanıcıyı login sayfasına yönlendir
      return { success: true, user: data.user };
    } else {
      console.error('Kayıt hatası:', data.message || data.errors);
      return { success: false, error: data.message || data.errors };
    }
  } catch (error) {
    console.error('Network hatası:', error);
    return { success: false, error: 'Bağlantı hatası' };
  }
}
```

---

### React/Vue/Vanilla JS - Login

```javascript
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Token'ı sakla
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Giriş başarılı:', data.user);
      return { success: true, token: data.token, user: data.user };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Bağlantı hatası' };
  }
}
```

---

### React/Vue/Vanilla JS - Get Profile (Korumalı Endpoint)

```javascript
async function getProfile() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return { success: false, error: 'Token bulunamadı' };
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data.user };
    } else {
      // Token geçersiz - logout yap
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Bağlantı hatası' };
  }
}
```

---

### React/Vue/Vanilla JS - Forgot Password

```javascript
async function forgotPassword(email) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      // Development için resetLink göster (test amaçlı)
      if (data.resetLink) {
        console.log('Reset Link (DEV):', data.resetLink);
      }
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Bağlantı hatası' };
  }
}
```

---

### React/Vue/Vanilla JS - Reset Password

```javascript
async function resetPassword(token, newPassword) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Şifre güncellendi!');
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Bağlantı hatası' };
  }
}

// URL'den token'ı almak için:
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
```

---

## 🎨 Frontend Sayfaları (Gerekli)

### 1. Login Sayfası
- Email ve şifre inputları
- "Giriş Yap" butonu
- "Şifremi Unuttum" linki → Forgot Password sayfasına yönlendir
- "Hesabın yok mu? Kayıt Ol" linki

### 2. Register Sayfası
- Ad Soyad, Email, Şifre inputları
- "Kayıt Ol" butonu
- "Zaten hesabın var mı? Giriş Yap" linki

### 3. Forgot Password Sayfası
- Email inputu
- "Şifre Sıfırlama Linki Gönder" butonu
- Başarı mesajı göster (email gönderildi)
- "Girişe Dön" linki

### 4. Reset Password Sayfası
- URL'den token'ı al (`?token=...`)
- Yeni Şifre inputu
- Yeni Şifre Tekrar inputu
- Password strength göstergesi (opsiyonel ama güzel)
- "Şifremi Güncelle" butonu
- Başarı sonrası → Login sayfasına yönlendir

### 5. Dashboard/Home Sayfası (Korumalı)
- Token kontrolü yap
- `/auth/me` ile kullanıcı bilgilerini çek
- Token yoksa veya geçersizse → Login'e yönlendir

---

## 🧪 Test Hesapları (Development)

```
Email: testuser@edirne.com
Şifre: yeniSifre123
```

Yeni hesap oluşturmak için register endpoint'ini kullanabilirsin.

---

## ⚠️ Önemli Notlar

### CORS
Backend'de CORS aktif:
```javascript
// İzin verilen origin
FRONTEND_URL=http://localhost:3000
```

Eğer frontend farklı portta çalışıyorsa (ör. React default 3000, Vite 5173), backend `.env` dosyasında `FRONTEND_URL` güncellenmeli.

### Token Yönetimi
- Token'ı `localStorage` veya `sessionStorage`'da sakla
- Her korumalı API çağrısında `Authorization: Bearer {token}` header'ı ekle
- 401 hatası alırsan (Unauthorized) → Token geçersiz, logout yap

### Error Handling
- Tüm error response'ları `{ status: "error", message: "..." }` formatında
- Validation hataları `errors` array'inde gelir
- Rate limit hataları 429 status code ile gelir

### Password Validation (Frontend'de yapılabilir)
- Minimum 6 karakter
- Opsiyonel: En az 1 büyük harf, 1 küçük harf, 1 rakam öner

### Email Validation
- Email formatı kontrolü (regex)
- Backend de kontrol ediyor ama frontend UX için önemli

---

## 📂 Örnek HTML Dosyaları (Referans için)

Backend repo'sunda hazır HTML örnekleri var:
- `frontend-examples/forgot-password.html`
- `frontend-examples/reset-password.html`

Bu dosyalar vanilla JavaScript ile yazılmış, React/Vue'ya çevrilebilir.

---

## 🐛 Troubleshooting

### CORS Hatası
```
Access to fetch at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Çözüm:** Backend `.env` dosyasında:
```
FRONTEND_URL=http://localhost:5173
```

### Token Geçersiz (401)
- Token süresi dolmuş olabilir (7 gün)
- Token format hatalı (Bearer prefix unutulmuş)
- Logout yapıp tekrar login ol

### Rate Limit (429)
- Login: 1 dakika bekle
- Forgot Password: 15 dakika bekle
- Test ederken farklı IP kullan veya backend'de geçici devre dışı bırak

---

## 📞 Backend Developer İletişim

Sorun olursa:
1. Terminal loglarını kontrol et (backend console)
2. Thunder Client ile API'yi doğrudan test et
3. `.env` ayarlarını kontrol et
4. Database bağlantısını kontrol et

---

## 🚀 Quick Start (Hızlı Başlangıç)

1. **Backend çalışıyor mu kontrol et:**
   ```bash
   curl http://localhost:3000/api/auth/me
   # veya tarayıcıda aç
   ```

2. **Test register:**
   ```javascript
   fetch('http://localhost:3000/api/auth/register', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       full_name: 'Test User',
       email: 'test@test.com',
       password: 'test123'
     })
   }).then(r => r.json()).then(console.log);
   ```

3. **Test login:**
   ```javascript
   fetch('http://localhost:3000/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'test@test.com',
       password: 'test123'
     })
   }).then(r => r.json()).then(console.log);
   ```

---

## 📊 API Endpoint Özeti

| Method | Endpoint | Auth Required | Rate Limit | Açıklama |
|--------|----------|---------------|------------|----------|
| POST | `/auth/register` | ❌ | - | Yeni kullanıcı kaydı |
| POST | `/auth/login` | ❌ | 6/dk | Giriş yap, token al |
| GET | `/auth/me` | ✅ | - | Kullanıcı profili |
| POST | `/auth/forgot-password` | ❌ | 3/15dk | Şifre sıfırlama isteği |
| POST | `/auth/reset-password` | ❌ | - | Yeni şifre belirle |

---

Bu döküman frontend developer'ın ihtiyacı olan her şeyi içeriyor! 🎉
