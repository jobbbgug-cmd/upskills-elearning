require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", default: null },
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["online", "onsite"], required: true, default: "online" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

async function fixOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all onsite categories sorted by createdAt
    const onsiteCategories = await Category.find({ type: 'onsite' }).sort({ createdAt: 1 });
    console.log(`Found ${onsiteCategories.length} onsite categories\n`);

    // Assign order sequentially
    console.log('🔄 Fixing order values:');
    for (let i = 0; i < onsiteCategories.length; i++) {
      const cat = onsiteCategories[i];
      await Category.findByIdAndUpdate(cat._id, { order: i });
      console.log(`  ${(i).toString().padStart(2)} → ${cat.name}`);
    }

    console.log('\n✅ Fixed! All onsite categories now have sequential order (0-' + (onsiteCategories.length - 1) + ')');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixOrder();
