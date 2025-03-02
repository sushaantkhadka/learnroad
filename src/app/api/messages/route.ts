import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import Message from "@/models/message"
import User from "@/models/user"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const messages = await Message.find({
      $or: [
        { senderId: session.user.id, receiverId: userId },
        { senderId: userId, receiverId: session.user.id },
      ],
    }).sort({ timestamp: 1 })

    const userIds = new Set(messages.flatMap((m) => [m.senderId, m.receiverId]))
    const users = await User.find({ _id: { $in: Array.from(userIds) } })
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]))

    const messagesWithNames = messages.map((m) => ({
      ...m.toObject(),
      senderName: userMap.get(m.senderId) || "Unknown User",
      receiverName: userMap.get(m.receiverId) || "Unknown User",
    }))

    return NextResponse.json(messagesWithNames)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const formData = await req.formData()
    const receiverId = formData.get("receiverId") as string
    const content = formData.get("content") as string
    const file = formData.get("file") as File | null

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 })
    }

    let fileUrl, fileName, fileType

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = join(process.cwd(), "public", "uploads")
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      fileName = `${file.name.split(".")[0]}-${uniqueSuffix}.${file.name.split(".").pop()}`
      const filePath = join(uploadDir, fileName)

      await writeFile(filePath, buffer)
      fileUrl = `/uploads/${fileName}`
      fileType = file.type
    }

    const newMessage = await Message.create({
      senderId: session.user.id,
      receiverId,
      content,
      timestamp: new Date(),
      fileUrl,
      fileName,
      fileType,
    })

    const [sender, receiver] = await Promise.all([User.findById(session.user.id), User.findById(receiverId)])

    const messageWithNames = {
      ...newMessage.toObject(),
      senderName: sender ? sender.name : "Unknown User",
      receiverName: receiver ? receiver.name : "Unknown User",
    }

    return NextResponse.json(messageWithNames, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

