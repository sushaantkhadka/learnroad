import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import Review from "@/models/review"
import Session from "@/models/session"
import TutorProfile from "@/models/tutor-profile"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const tutorId = url.searchParams.get("tutorId")

    if (!tutorId) {
      return NextResponse.json({ error: "Tutor ID is required" }, { status: 400 })
    }

    const reviews = await Review.find({ tutor: tutorId })
      .populate("student", "name profileImage")
      .sort({ createdAt: -1 })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { tutorId, sessionId, rating, comment } = body

    // Verify that the session exists and belongs to the student
    const tutorSession = await Session.findOne({
      _id: sessionId,
      student: session.user.id,
      tutor: tutorId,
      status: "completed",
    })

    if (!tutorSession) {
      return NextResponse.json({ error: "Session not found or not completed" }, { status: 404 })
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      student: session.user.id,
      tutor: tutorId,
      session: sessionId,
    })

    if (existingReview) {
      return NextResponse.json({ error: "Review already exists for this session" }, { status: 400 })
    }

    // Create new review
    const newReview = await Review.create({
      student: session.user.id,
      tutor: tutorId,
      session: sessionId,
      rating,
      comment,
    })

    // Update tutor's average rating
    const tutorReviews = await Review.find({ tutor: tutorId })
    const totalRating = tutorReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / tutorReviews.length

    await TutorProfile.findOneAndUpdate(
      { user: tutorId },
      {
        averageRating: Number.parseFloat(averageRating.toFixed(1)),
        totalReviews: tutorReviews.length,
      },
    )

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

