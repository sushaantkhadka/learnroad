import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import TutorProfile from "@/models/tutor-profile"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const tutorProfile = await TutorProfile.findOne({ user: session.user.id })

    if (!tutorProfile) {
      return NextResponse.json({ error: "Tutor profile not found" }, { status: 404 })
    }

    return NextResponse.json(tutorProfile)
  } catch (error) {
    console.error("Error fetching tutor profile:", error)
    return NextResponse.json({ error: "An error occurred while fetching the tutor profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subjects, teachingStyles, hourlyRate, bio, availability } = await req.json()

    await connectDB()

    const updatedProfile = await TutorProfile.findOneAndUpdate(
      { user: session.user.id },
      { subjects, teachingStyles, hourlyRate, bio, availability },
      { new: true, upsert: true },
    )

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating tutor profile:", error)
    return NextResponse.json({ error: "An error occurred while updating the tutor profile" }, { status: 500 })
  }
}

