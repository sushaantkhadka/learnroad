import mongoose, { Schema, models } from "mongoose"

const questionSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "short-answer"],
    default: "multiple-choice",
  },
})

const quizSchema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
})

export const Quiz = models.Quiz || mongoose.model("Quiz", quizSchema)

