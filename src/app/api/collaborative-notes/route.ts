import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import CollaborativeNote from "@/models/collaborative-note"
import Session from "@/models/session"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const url = new URL(req.url)
    const sessionId = url.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Verify user has access to this session
    const tutorSession = await Session.findOne({
      _id: sessionId,
      $or: [{ student: session.user.id }, { tutor: session.user.id }],
    })

    if (!tutorSession) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 })
    }

    // Get or create collaborative note
    let note = await CollaborativeNote.findOne({ session: sessionId })

    if (!note) {
      note = await CollaborativeNote.create({
        session: sessionId,
        content: "",
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
      })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error fetching collaborative note:", error)
    return NextResponse.json({ error: "Failed to fetch collaborative note" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { sessionId, content } = body

    // Verify user has access to this session
    const tutorSession = await Session.findOne({
      _id: sessionId,
      $or: [{ student: session.user.id }, { tutor: session.user.id }],
    })

    if (!tutorSession) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 })
    }

    // Update or create collaborative note
    const updatedNote = await CollaborativeNote.findOneAndUpdate(
      { session: sessionId },
      {
        content,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
      },
      { new: true, upsert: true },
    )

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error updating collaborative note:", error)
    return NextResponse.json({ error: "Failed to update collaborative note" }, { status: 500 })
  }
}

