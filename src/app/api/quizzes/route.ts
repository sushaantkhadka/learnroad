import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import Quiz from "@/models/quiz"
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

    // Get quizzes for this session
    const quizzes = await Quiz.find({ session: sessionId })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { sessionId, title, questions } = body

    // Verify tutor has access to this session
    const tutorSession = await Session.findOne({
      _id: sessionId,
      tutor: session.user.id,
    })

    if (!tutorSession) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 })
    }

    // Create new quiz
    const newQuiz = await Quiz.create({
      session: sessionId,
      title,
      questions,
      createdBy: session.user.id,
    })

    return NextResponse.json(newQuiz, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}

