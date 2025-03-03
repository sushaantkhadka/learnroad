import mongoose, { Schema, models } from "mongoose"

const reviewSchema = new Schema({
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
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Review = models.Review || mongoose.model("Review", reviewSchema)

