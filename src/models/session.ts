import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ISession extends Document {
  student: mongoose.Types.ObjectId
  tutor: mongoose.Types.ObjectId
  subject: string
  date: Date
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  meetingLink?: string
}

const SessionSchema = new Schema<ISession>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
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
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
    notes: {
      type: String,
    },
    meetingLink: {
      type: String,
    },
  },
  { timestamps: true },
)

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema)

export default Session

