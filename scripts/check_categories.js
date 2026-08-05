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

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check online categories
    const online = await Category.find({ type: 'online' }).sort({ order: 1 });
    console.log('📱 ONLINE CATEGORIES:');
    online.forEach(c => {
      console.log(`  ${c.name.padEnd(30)} - order: ${c.order}`);
    });

    // Check onsite categories
    const onsite = await Category.find({ type: 'onsite' }).sort({ order: 1 });
    console.log('\n🏢 ONSITE CATEGORIES:');
    onsite.forEach(c => {
      console.log(`  ${c.name.padEnd(30)} - order: ${c.order}`);
    });

    // Check for duplicate orders in onsite
    const onsiteOrders = onsite.map(c => c.order);
    const duplicates = onsiteOrders.filter((v, i) => onsiteOrders.indexOf(v) !== i);
    if (duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE ORDERS FOUND:', [...new Set(duplicates)]);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

check();
