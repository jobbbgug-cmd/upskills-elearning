import mongoose, { Schema, Document, Types } from "mongoose";

interface IInvoice extends Document {
  _id: Types.ObjectId;
  orderId: string;
  courseId: string;
  courseName: string;

  // Seller info
  sellerName: string;
  sellerAddress: string;
  sellerTaxId: string;
  sellerPhone: string;

  // Buyer info
  buyerName: string;
  buyerAddress: string;
  buyerTaxId: string;
  buyerPhone: string;
  buyerEmail: string;

  // Invoice details
  amount: number;
  taxAmount: number;
  totalAmount: number;
  invoiceDate: Date;
  invoiceNumber?: string;

  // Status
  status: "pending" | "issued" | "paid";

  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    orderId: { type: String, required: true },
    courseId: { type: String, required: true },
    courseName: { type: String, required: true },

    sellerName: { type: String, required: true },
    sellerAddress: { type: String, required: true },
    sellerTaxId: { type: String, required: true },
    sellerPhone: { type: String, required: true },

    buyerName: { type: String, required: true },
    buyerAddress: { type: String, required: true },
    buyerTaxId: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    buyerEmail: { type: String, required: true },

    amount: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    invoiceDate: { type: Date, default: Date.now },
    invoiceNumber: { type: String },

    status: { type: String, enum: ["pending", "issued", "paid"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
