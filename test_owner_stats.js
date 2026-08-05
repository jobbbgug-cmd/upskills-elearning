require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if models exist
    const User = mongoose.model('User');
    const Course = mongoose.model('Course');
    const Booking = mongoose.model('Booking');

    const testInstitutionId = "6a63a7da499c0aa33fe0b009";

    const [users, courses, bookings] = await Promise.all([
      User.countDocuments({ institutionId: testInstitutionId }),
      Course.countDocuments({ institutionId: testInstitutionId }),
      Booking.countDocuments({ institutionId: testInstitutionId }),
    ]);

    console.log("Stats:", { users, courses, bookings });
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

test();
