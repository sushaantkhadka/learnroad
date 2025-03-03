import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { Session } from "@/models/session"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const tutorId = searchParams.get("tutorId")
    const status = searchParams.get("status")

    const query: any = {}

    if (tutorId) {
      query.tutorId = tutorId
    } else {
      query[session.user.role === "student" ? "studentId" : "tutorId"] = session.user.id
    }

    if (status) {
      query.status = status
    }

    if (type === "upcoming") {
      query.$or = [{ date: { $gte: new Date() } }, { status: { $in: ["scheduled", "in-progress"] } }]
    } else if (type === "past") {
      query.$or = [{ date: { $lt: new Date() } }, { status: { $in: ["completed", "cancelled"] } }]
    }

    const sessions = await Session.find(query)
      .sort({ date: 1 })
      .populate("studentId", "name profileImage")
      .populate("tutorId", "name profileImage")
      .lean()

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { tutorId, subject, date, startTime, endTime, price } = await request.json()

    // Create mock Google Meet link
    const meetLink = createMockGoogleMeetLink()

    const newSession = new Session({
      studentId: session.user.id,
      tutorId,
      subject,
      date,
      startTime,
      endTime,
      status: "scheduled",
      price,
      paymentStatus: "pending",
      meetingLink: meetLink,
    })

    await newSession.save()

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error("Error booking session:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

function createMockGoogleMeetLink(): string {
  const randomId = Math.random().toString(36).substring(7)
  return `https://meet.google.com/${randomId}`
}

