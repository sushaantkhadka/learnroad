import mongoose, { Schema, models } from "mongoose"

const tutorProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subjects: [
    {
      type: String,
    },
  ],
  hourlyRate: {
    type: Number,
    default: 0,
  },
  availability: [
    {
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
      startTime: String,
      endTime: String,
    },
  ],
  bio: {
    type: String,
    default: "",
  },
  teachingStyle: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  withdrawnEarnings: {
    type: Number,
    default: 0,
  },
})

export const TutorProfile = models.TutorProfile || mongoose.model("TutorProfile", tutorProfileSchema)

