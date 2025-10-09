// Veritabanı bağlantı ayarları
//bu kod mongodb için yazılmış sql kullanırken değiştirmemiz lazım!!!!!!!!!!!!!!!!!!!!
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Veritabanına başarıyla bağlanıldı');
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
