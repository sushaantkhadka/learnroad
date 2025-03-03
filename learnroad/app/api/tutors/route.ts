import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { TutorProfile } from "@/models/tutor-profile"

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get("subject")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query = subject ? { subjects: { $in: [subject] } } : {}

    const tutors = await TutorProfile.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email profileImage")

    const totalTutors = await TutorProfile.countDocuments(query)

    return NextResponse.json({
      tutors,
      currentPage: page,
      totalPages: Math.ceil(totalTutors / limit),
      totalTutors,
    })
  } catch (error) {
    console.error("Error fetching tutors:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

