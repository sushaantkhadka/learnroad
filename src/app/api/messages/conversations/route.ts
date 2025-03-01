import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import Message from "@/models/message"
import User from "@/models/user"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id

    // Find all messages where the user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ timestamp: -1 })

    // Group messages by conversation partner
    const conversationsMap = new Map()

    for (const message of messages) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          userId: partnerId,
          lastMessage: message.content,
          timestamp: message.timestamp,
        })
      }
    }

    // Fetch user details for conversation partners
    const conversationsArray = await Promise.all(
      Array.from(conversationsMap.entries()).map(async ([partnerId, conversation]) => {
        const partner = await User.findById(partnerId)
        return {
          ...conversation,
          userName: partner ? partner.name : "Unknown User",
        }
      }),
    )

    // Sort conversations by the timestamp of the last message
    conversationsArray.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return NextResponse.json(conversationsArray)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

