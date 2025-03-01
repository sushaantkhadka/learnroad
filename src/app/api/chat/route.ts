import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import Message from "@/models/message"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const url = new URL(req.url)
    const recipientId = url.searchParams.get("recipientId")

    if (!recipientId) {
      return NextResponse.json({ error: "Recipient ID is required" }, { status: 400 })
    }

    const messages = await Message.find({
      $or: [
        { senderId: session.user.id, receiverId: recipientId },
        { senderId: recipientId, receiverId: session.user.id },
      ],
    }).sort({ timestamp: 1 })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { recipientId, content } = await req.json()

    if (!recipientId || !content) {
      return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 })
    }

    const newMessage = await Message.create({
      senderId: session.user.id,
      receiverId: recipientId,
      content,
      timestamp: new Date(),
    })

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

