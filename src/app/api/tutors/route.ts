import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import TutorProfile from "@/models/tutor-profile"
import User from "@/models/user"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const subject = url.searchParams.get("subject")
    const teachingStyle = url.searchParams.get("teachingStyle")

    const query: any = {}

    if (subject) {
      query.subjects = { $in: [subject] }
    }

    if (teachingStyle) {
      query.teachingStyle = { $in: [teachingStyle] }
    }

    const tutorProfiles = await TutorProfile.find(query).populate({
      path: "user",
      select: "name email profileImage bio",
    })

    return NextResponse.json(tutorProfiles)
  } catch (error) {
    console.error("Error fetching tutors:", error)
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { userId, subjects, hourlyRate, education, experience, teachingStyle, availability } = body

    // Check if user exists and is a tutor
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "tutor") {
      return NextResponse.json({ error: "User is not a tutor" }, { status: 400 })
    }

    // Check if tutor profile already exists
    const existingProfile = await TutorProfile.findOne({ user: userId })
    if (existingProfile) {
      return NextResponse.json({ error: "Tutor profile already exists" }, { status: 400 })
    }

    // Create new tutor profile
    const tutorProfile = await TutorProfile.create({
      user: userId,
      subjects,
      hourlyRate,
      education,
      experience,
      teachingStyle,
      availability,
    })

    return NextResponse.json(tutorProfile, { status: 201 })
  } catch (error) {
    console.error("Error creating tutor profile:", error)
    return NextResponse.json({ error: "Failed to create tutor profile" }, { status: 500 })
  }
}

