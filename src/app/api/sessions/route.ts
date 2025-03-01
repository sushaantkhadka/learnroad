import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import Session from "@/models/session"
import TutorProfile from "@/models/tutor-profile"
import mongoose from "mongoose"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id
    const userRole = session.user.role

    let query = {}

    if (userRole === "student") {
      query = { student: userId }
    } else if (userRole === "tutor") {
      query = { tutor: userId }
    }

    const sessions = await Session.find(query)
      .populate("student", "name email")
      .populate("tutor", "name email")
      .sort({ date: 1, startTime: 1 })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { tutorId, date, timeSlot, subject } = body

    if (!tutorId || !date || !timeSlot || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate tutor availability
    const tutorProfile = await TutorProfile.findOne({ user: tutorId })
    if (!tutorProfile) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 })
    }

    const bookingDate = new Date(date)
    const dayOfWeek = bookingDate.toLocaleDateString("en-US", { weekday: "long" })
    const [startTime, endTime] = timeSlot.split(" - ")

    const availableSlot = tutorProfile.availability.find(
      (slot) => slot.day === dayOfWeek && slot.startTime === startTime && slot.endTime === endTime,
    )

    if (!availableSlot) {
      return NextResponse.json({ error: "Selected time slot is not available" }, { status: 400 })
    }

    // Check if the slot is already booked
    const existingSession = await Session.findOne({
      tutor: tutorId,
      date: bookingDate,
      startTime,
      endTime,
      status: { $in: ["pending", "confirmed"] },
    })

    if (existingSession) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 400 })
    }

    // Create new session
    const newSession = await Session.create({
      student: session.user.id,
      tutor: tutorId,
      subject,
      date: bookingDate,
      startTime,
      endTime,
      status: "pending",
    })

    // Populate student and tutor information
    await newSession.populate("student", "name email")
    await newSession.populate("tutor", "name email")

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error("Error creating session:", error)
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

