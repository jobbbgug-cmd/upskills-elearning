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

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all onsite categories sorted by creation date
    const onsiteCategories = await Category.find({ type: 'onsite' }).sort({ createdAt: 1 });
    console.log(`Found ${onsiteCategories.length} onsite categories`);

    // Assign order sequentially
    let orderCounter = 0;
    for (const cat of onsiteCategories) {
      await Category.findByIdAndUpdate(cat._id, { order: orderCounter });
      console.log(`Updated ${cat.name} with order ${orderCounter}`);
      orderCounter++;
    }

    console.log('Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
