import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IMessage extends Document {
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  fileUrl?: string
  fileName?: string
  fileType?: string
}

const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  fileUrl: {
    type: String,
  },
  fileName: {
    type: String,
  },
  fileType: {
    type: String,
  },
})

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)

export default Message

