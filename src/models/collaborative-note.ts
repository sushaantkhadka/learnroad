import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ICollaborativeNote extends Document {
  session: mongoose.Types.ObjectId
  content: string
  lastEditedBy: mongoose.Types.ObjectId
  lastEditedAt: Date
}

const CollaborativeNoteSchema = new Schema<ICollaborativeNote>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastEditedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const CollaborativeNote: Model<ICollaborativeNote> =
  mongoose.models.CollaborativeNote || mongoose.model<ICollaborativeNote>("CollaborativeNote", CollaborativeNoteSchema)

export default CollaborativeNote

