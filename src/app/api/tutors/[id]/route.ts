import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import TutorProfile from "@/models/tutor-profile"
import User from "@/models/user"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const tutorProfile = await TutorProfile.findOne({ user: params.id }).lean()

    if (!tutorProfile) {
      console.error(`Tutor profile not found for id: ${params.id}`)
      return NextResponse.json({ error: "Tutor profile not found" }, { status: 404 })
    }

    const user = await User.findById(params.id).select("name email profileImage").lean()

    if (!user) {
      console.error(`User not found for id: ${params.id}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const tutor = {
      ...tutorProfile,
      ...user,
      id: user._id.toString(),
    }

    return NextResponse.json(tutor)
  } catch (error) {
    console.error("Error fetching tutor profile:", error)
    return NextResponse.json({ error: "An error occurred while fetching the tutor profile" }, { status: 500 })
  }
}

