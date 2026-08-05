import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["online", "onsite", "live online"], required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.index({ name: 1, type: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

const categories = [
  // Online
  { name: "AI & Automation", type: "online", order: 0 },
  { name: "ธุรกิจ", type: "online", order: 1 },
  { name: "การตลาดออนไลน์", type: "online", order: 2 },
  { name: "การวิจัย & สังคม", type: "online", order: 3 },
  { name: "การพัฒนาเอนจิน", type: "online", order: 4 },
  { name: "Office Productivity", type: "online", order: 5 },
  { name: "Data", type: "online", order: 6 },
  { name: "เยียมโปรแกรม", type: "online", order: 7 },
  { name: "การพัฒนาซอฟต์แวร์", type: "online", order: 8 },
  { name: "Framework การพัฒนาซอฟต์แวร์", type: "online", order: 9 },
  { name: "โครงสร้างซอฟต์แวร์", type: "online", order: 10 },
  { name: "การออกแบบ", type: "online", order: 11 },
  { name: "Art & Craft", type: "online", order: 12 },
  { name: "การเรียน", type: "online", order: 13 },
  { name: "ภาพศิลป์ & วิดีโอ", type: "online", order: 14 },
  { name: "ภาษา", type: "online", order: 15 },
  
  // Onsite
  { name: "ศิลปศาสตร์", type: "onsite", order: 0 },
  { name: "ภาษาต่างประเทศ", type: "onsite", order: 1 },
  { name: "ภาษาไทย", type: "onsite", order: 2 },
  { name: "วิทยาศาสตร์", type: "onsite", order: 3 },
  { name: "วิทยาศาสตร์และเทคโนโลยี", type: "onsite", order: 4 },
  { name: "สิ่งแต่มปลูกสาขนและวัฒนธรรม", type: "onsite", order: 5 },
  { name: "สุขศึกษาและศาตเศาะ", type: "onsite", order: 6 },
  { name: "ศิลปะ", type: "onsite", order: 7 },
  { name: "การอนาธิพ", type: "onsite", order: 8 },
  { name: "อุตสาห/สถาบ.", type: "onsite", order: 9 },
  { name: "อื่นๆ", type: "onsite", order: 10 },
];

async function restore() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const inserted = await Category.insertMany(categories);
    console.log(`✅ Inserted ${inserted.length} categories`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

restore();
