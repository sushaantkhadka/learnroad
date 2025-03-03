import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { TutorProfile } from "@/models/tutor-profile"
import { Review } from "@/models/review"
import { User } from "@/models/user"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const tutorProfile = await TutorProfile.findOne({ userId: params.id }).lean()

    if (!tutorProfile) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 })
    }

    const user = await User.findById(params.id).select("name email profileImage").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const reviews = await Review.find({ tutorId: params.id })
      .populate("studentId", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    const tutor = {
      ...tutorProfile,
      userId: user,
    }

    return NextResponse.json({ tutor, reviews })
  } catch (error) {
    console.error("Error fetching tutor details:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

