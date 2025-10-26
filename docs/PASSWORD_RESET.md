# Şifremi Unuttum (Password Reset) Özelliği

## Genel Bakış
Bu özellik, kullanıcıların şifrelerini unuttuklarında güvenli bir şekilde sıfırlamalarına olanak tanır.

## Akış (User Flow)

### 1. Forgot Password (Şifremi Unuttum)
- Kullanıcı login ekranında "Şifremi Unuttum" linkine tıklar
- Email adresini girer
- Backend:
  - Kullanıcıyı bulur (bulamazsa da aynı mesajı döner - güvenlik)
  - Rastgele token oluşturur (32 byte hex)
  - Token'ı veritabanına kaydeder (1 saat geçerlilik)
  - Email gönderir (şifre sıfırlama linki ile)
- Frontend: Başarı mesajı gösterir

### 2. Email Link
- Kullanıcı email'deki linke tıklar
- Link formatı: `http://localhost:3000/reset-password?token=ABC123...`
- Frontend reset-password sayfası açılır

### 3. Reset Password (Yeni Şifre Belirleme)
- Kullanıcı:
  - Yeni şifre girer
  - Yeni şifreyi tekrar girer (validation)
- Backend:
  - Token'ı doğrular (geçerli mi, süresi dolmamış mı, kullanılmamış mı)
  - Şifreyi hashler
  - Veritabanında günceller
  - Token'ı "kullanıldı" olarak işaretler
- Frontend: Başarı mesajı + login'e yönlendirme

---

## Backend Endpoints

### POST `/api/auth/forgot-password`
Şifre sıfırlama talebi başlatır.

**Request:**
\`\`\`json
{
  "email": "kullanici@edirne.com"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "status": "success",
  "message": "Eğer hesabınız varsa, şifre sıfırlama bağlantısı e-posta adresinize gönderildi",
  "resetLink": "http://localhost:3000/reset-password?token=..." // sadece dev modunda
}
\`\`\`

**Rate Limit:** 3 istek / 15 dakika (IP başına)

---

### POST `/api/auth/reset-password`
Yeni şifre ile güncelleme yapar.

**Request:**
\`\`\`json
{
  "token": "abc123...",
  "newPassword": "yeniGucluSifre123"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "status": "success",
  "message": "Şifreniz başarıyla güncellendi"
}
\`\`\`

**Response (Error - Invalid/Expired Token):**
\`\`\`json
{
  "status": "error",
  "message": "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı"
}
\`\`\`

---

## Veritabanı

### Tablo: `password_reset_tokens`
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INT | Primary key |
| user_id | INT | Foreign key → users.id |
| token | VARCHAR(255) | Unique, rastgele token |
| expires_at | DATETIME | Geçerlilik süresi (1 saat) |
| used | TINYINT | 0=kullanılmadı, 1=kullanıldı |
| created_at | TIMESTAMP | Oluşturulma zamanı |

**Migration:**
\`\`\`bash
node scripts/run_migration.js
\`\`\`

---

## Email Servisi Kurulumu

### 1. Nodemailer Kurulu (✅)
\`\`\`bash
npm install nodemailer
\`\`\`

### 2. .env Ayarları
\`\`\`.env
# Email servisi (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password    # Gmail için "App Password" oluştur
SMTP_FROM=noreply@edirne.com
SMTP_FROM_NAME=Edirne Rota

# Frontend URL
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. Gmail App Password Oluşturma
1. Google Account → Security
2. 2-Step Verification'ı aç
3. "App passwords" bölümünden yeni password oluştur
4. \`.env\` dosyasına yapıştır

---

## Frontend Entegrasyonu

### Örnek Dosyalar
- \`frontend-examples/forgot-password.html\` — Şifremi unuttum formu
- \`frontend-examples/reset-password.html\` — Yeni şifre formu

### Kullanım (React/Vue/HTML örneği)

**1. Forgot Password Sayfası:**
\`\`\`javascript
// Email gönder
const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'kullanici@edirne.com' })
});

const data = await response.json();
console.log(data.message); // Başarı mesajı
\`\`\`

**2. Reset Password Sayfası:**
\`\`\`javascript
// URL'den token al
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Yeni şifreyi gönder
const response = await fetch('http://localhost:3000/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    token: token,
    newPassword: 'yeniSifre123' 
  })
});

const data = await response.json();
if (data.status === 'success') {
  // Login'e yönlendir
  window.location.href = '/login';
}
\`\`\`

---

## Test Senaryosu

### Manuel Test (Geliştirme Ortamı)

1. **Kullanıcı oluştur (eğer yoksa):**
\`\`\`bash
# PowerShell
\$body = @{ full_name="Test User"; email="test@edirne.com"; password="eski123" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/register -ContentType 'application/json' -Body \$body
\`\`\`

2. **Forgot password isteği gönder:**
\`\`\`bash
\$resp = Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/forgot-password -ContentType 'application/json' -Body '{"email":"test@edirne.com"}'
\$resp
# resetLink'i kopyala (dev modunda response'da gelir)
\`\`\`

3. **Reset link'i aç (tarayıcıda):**
\`\`\`
http://localhost:3000/reset-password?token=ABC123...
\`\`\`

4. **Yeni şifre ile reset:**
\`\`\`bash
\$token = "ABC123..."  # yukarıdan aldığın token
\$body = @{ token=\$token; newPassword="yeniSifre123" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/reset-password -ContentType 'application/json' -Body \$body
\`\`\`

5. **Yeni şifre ile login:**
\`\`\`bash
\$body = @{ email="test@edirne.com"; password="yeniSifre123" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/auth/login -ContentType 'application/json' -Body \$body
\`\`\`

---

## Güvenlik Özellikleri

✅ Token'lar rastgele (crypto.randomBytes)  
✅ Token'lar tek kullanımlık (used flag)  
✅ 1 saat geçerlilik süresi  
✅ Rate limiting (15 dakikada 3 istek)  
✅ Kullanıcı var/yok bilgisi verilmiyor (generic mesaj)  
✅ Şifreler bcrypt ile hashlenmiş  
✅ HTTPS kullanımı önerilir (production)  

---

## Troubleshooting

### Email gönderilmiyor
- \`.env\` dosyasındaki SMTP ayarlarını kontrol et
- Gmail kullanıyorsan "App Password" oluşturuldu mu?
- Firewall/antivirus SMTP portunu (587) engelliyor mu?
- Geliştirme modunda console'da email içeriği görünür

### Token geçersiz hatası
- Token'ın süresi dolmuş olabilir (1 saat)
- Token zaten kullanılmış olabilir
- Token doğru kopyalanmamış olabilir (whitespace vs.)

### Rate limit hatası
- 15 dakika bekle veya farklı bir IP'den dene
- Geliştirme için rate limit'i routes'dan geçici kaldırabilirsin

---

## Production Checklist

- [ ] SMTP ayarlarını production servisine (SendGrid, AWS SES, Mailgun) geçir
- [ ] \`FRONTEND_URL\` env var'ını production domain'e ayarla
- [ ] \`NODE_ENV=production\` ayarla (dev link'lerini gizler)
- [ ] HTTPS kullan
- [ ] Email template'lerini brand'e göre özelleştir
- [ ] Rate limit'leri ihtiyaca göre ayarla
- [ ] Eski/expired token'ları temizleyen cron job ekle
