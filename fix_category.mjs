import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixCategory() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    // Drop collection
    await mongoose.connection.collection('categories').drop();
    console.log('✅ Dropped categories collection');

    await mongoose.connection.close();
    console.log('✅ Done! Categories collection reset');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixCategory();
