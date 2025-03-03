import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { Message } from "@/models/message"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const messages = await Message.find({
      $or: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "name profileImage")
      .populate("receiverId", "name profileImage")

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { receiverId, content } = await request.json()

    const newMessage = new Message({
      senderId: session.user.id,
      receiverId,
      content,
      createdAt: new Date(),
    })

    await newMessage.save()

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name profileImage")
      .populate("receiverId", "name profileImage")

    return NextResponse.json(populatedMessage, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

