import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ITutorProfile extends Document {
  user: mongoose.Types.ObjectId
  subjects: string[]
  hourlyRate: number
  education: string
  experience: string
  teachingStyles: string[]
  availability: {
    day: string
    startTime: string
    endTime: string
  }[]
  averageRating: number
  totalReviews: number
}

const TutorProfileSchema = new Schema<ITutorProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjects: {
      type: [String],
      required: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    teachingStyles: {
      type: [String],
      required: true,
    },
    availability: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

const TutorProfile: Model<ITutorProfile> =
  mongoose.models.TutorProfile || mongoose.model<ITutorProfile>("TutorProfile", TutorProfileSchema)

export default TutorProfile

