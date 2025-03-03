import mongoose, { Schema, models } from "mongoose"

const paymentSchema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: "Session",
    required: false,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  type: {
    type: String,
    enum: ["payment", "withdrawal"],
    default: "payment",
  },
  paymentMethod: {
    type: String,
    default: "",
  },
  transactionId: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Payment = models.Payment || mongoose.model("Payment", paymentSchema)

