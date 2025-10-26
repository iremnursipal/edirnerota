const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, findUserById } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const registerUser = async ({ full_name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw { status: 409, message: 'Bu e-posta zaten kullanılıyor' };

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ full_name, email, password: hashed });
  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw { status: 401, message: 'Geçersiz kimlik bilgileri' };

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw { status: 401, message: 'Geçersiz kimlik bilgileri' };

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return { user: { id: user.id, full_name: user.full_name, email: user.email }, token };
};

const getUserProfile = async (id) => {
  const user = await findUserById(id);
  if (!user) throw { status: 404, message: 'Kullanıcı bulunamadı' };
  return { id: user.id, full_name: user.full_name, email: user.email };
};

const forgotPassword = async (email) => {
  // Kullanıcıyı bul
  const user = await findUserByEmail(email);
  if (!user) {
    // Güvenlik için generic mesaj dön, kullanıcı var/yok bilgisi verme
    return { status: 'success', message: 'Eğer hesabınız varsa, şifre sıfırlama bağlantısı gönderilecektir' };
  }

  // Rastgele token oluştur
  const token = require('crypto').randomBytes(32).toString('hex');
  
  // Token'ın geçerlilik süresini ayarla (1 saat)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Token'ı kaydet
  await createPasswordResetToken(user.id, token, expiresAt);

  // TODO: E-posta gönderimi
  // Geliştirme aşamasında konsola yazdır
  const resetLink = `http://localhost:${process.env.PORT || 3000}/reset-password?token=${token}`;
  console.log('Password reset link:', resetLink);

  // Eğer development ise reset link'i response'a ekle (test kolaylığı için)
  const baseResponse = { status: 'success', message: 'Eğer hesabınız varsa, şifre sıfırlama bağlantısı gönderilecektir' };
  if (process.env.NODE_ENV !== 'production') {
    return { ...baseResponse, resetLink };
  }
  return baseResponse;
};

const resetPassword = async (token, newPassword) => {
  // Token'ı kontrol et
  const resetToken = await findValidPasswordResetToken(token);
  if (!resetToken) {
    throw { status: 400, message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı' };
  }

  // Yeni şifreyi hashle
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Şifreyi güncelle
  await updateUserPassword(resetToken.user_id, hashedPassword);
  
  // Token'ı kullanıldı olarak işaretle
  await markTokenAsUsed(resetToken.id);

  return { status: 'success', message: 'Şifreniz başarıyla güncellendi' };
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile,
  forgotPassword,
  resetPassword
};
