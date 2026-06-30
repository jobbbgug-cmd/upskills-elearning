const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/e-learning';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'teacher', 'admin', 'owner', 'super_admin', 'parent'], default: 'student' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  profileImage: String,
  phone: String,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

(async () => {
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB');

    // ลบ user เก่า (optional)
    await User.deleteOne({ email: 'jobbbgug@gmail.com' });

    // สร้าง super admin
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'jobbbgug@gmail.com',
      password: hashedPassword,
      role: 'super_admin',
      status: 'approved',
      phone: '0812345678',
    });

    await admin.save();
    console.log('✅ Created super admin account:');
    console.log('  Email: jobbbgug@gmail.com');
    console.log('  Password: password123');
    console.log('  Role: super_admin');

    await mongoose.disconnect();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
