import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IMessage extends Document {
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
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
})

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)

export default Message

