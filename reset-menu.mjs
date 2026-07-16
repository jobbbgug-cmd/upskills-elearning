import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function resetMenu() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const result = await db.collection('menuconfigs').deleteOne({ role: 'super_admin' });
    console.log('Deleted menu-config records:', result.deletedCount);
    
    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetMenu();
