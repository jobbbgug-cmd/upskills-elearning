require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", default: null },
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["online", "onsite"], required: true, default: "online" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all categories to add type: "onsite" if type doesn't exist
    const result = await Category.updateMany(
      { type: { $exists: false } },
      { $set: { type: "onsite" } }
    );

    console.log(`Updated ${result.modifiedCount} categories`);
    console.log('Migration completed!');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
