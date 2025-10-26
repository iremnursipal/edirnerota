/**
 * Email servisi - nodemailer ile email gönderimi
 */

const nodemailer = require('nodemailer');

// SMTP transporter oluştur
const createTransporter = () => {
  // Geliştirme ortamında test account kullan (ethereal.email)
  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
    console.warn('⚠️  SMTP ayarları bulunamadı, geliştirme modunda console log kullanılıyor');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Şifre sıfırlama emaili gönder
 * @param {string} to - Alıcı email adresi
 * @param {string} resetLink - Şifre sıfırlama linki
 * @param {string} userName - Kullanıcı adı (opsiyonel)
 */
const sendPasswordResetEmail = async (to, resetLink, userName = '') => {
  const transporter = createTransporter();

  // Eğer transporter yoksa (dev modda SMTP yoksa) sadece console'a yazdır
  if (!transporter) {
    console.log('\n📧 =============== ŞİFRE SIFIRLAMA EMAİLİ ===============');
    console.log(`Alıcı: ${to}`);
    console.log(`Kullanıcı: ${userName || 'N/A'}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('=======================================================\n');
    return { success: true, mode: 'console' };
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Edirne Rota'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Şifre Sıfırlama Talebi - Edirne Rota',
    html: generatePasswordResetHTML(resetLink, userName),
    text: generatePasswordResetText(resetLink, userName),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email gönderildi:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email gönderimi hatası:', error.message);
    throw new Error('Email gönderilemedi');
  }
};

/**
 * HTML email şablonu
 */
const generatePasswordResetHTML = (resetLink, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background-color: #f44336; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Şifre Sıfırlama</h1>
        </div>
        <div class="content">
          <p>Merhaba${userName ? ' ' + userName : ''},</p>
          <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Şifremi Sıfırla</a>
          </p>
          <p>Veya aşağıdaki linki tarayıcınıza kopyalayın:</p>
          <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">${resetLink}</p>
          <div class="warning">
            <strong>⚠️ Önemli:</strong> Bu link 1 saat içinde geçerliliğini yitirecektir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili görmezden gelebilirsiniz.
          </div>
        </div>
        <div class="footer">
          <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
          <p>&copy; ${new Date().getFullYear()} Edirne Rota. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Plain text email şablonu (HTML desteklemeyen mail istemcileri için)
 */
const generatePasswordResetText = (resetLink, userName) => {
  return `
Merhaba${userName ? ' ' + userName : ''},

Hesabınız için şifre sıfırlama talebinde bulundunuz.

Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
${resetLink}

⚠️ ÖNEMLI: Bu link 1 saat içinde geçerliliğini yitirecektir.

Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili görmezden gelebilirsiniz.

---
Bu otomatik bir emaildir, lütfen yanıtlamayın.
© ${new Date().getFullYear()} Edirne Rota. Tüm hakları saklıdır.
  `;
};

module.exports = {
  sendPasswordResetEmail,
};
