import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { TutorProfile } from "@/models/tutor-profile"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const tutorProfile = await TutorProfile.findOne({ userId: session.user.id })

    if (!tutorProfile) {
      return NextResponse.json({ error: "Tutor profile not found" }, { status: 404 })
    }

    return NextResponse.json(tutorProfile)
  } catch (error) {
    console.error("Error fetching tutor profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { subjects, hourlyRate, availability, bio, teachingStyle } = await request.json()

    const updatedProfile = await TutorProfile.findOneAndUpdate(
      { userId: session.user.id },
      {
        subjects,
        hourlyRate,
        availability,
        bio,
        teachingStyle,
      },
      { new: true },
    )

    if (!updatedProfile) {
      return NextResponse.json({ error: "Tutor profile not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating tutor profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

