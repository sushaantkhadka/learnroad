import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { Review } from "@/models/review"
import { TutorProfile } from "@/models/tutor-profile"
import { Session } from "@/models/session"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { tutorId, sessionId, rating, comment } = await request.json()

    if (!tutorId || !sessionId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 })
    }

    // Check if the student has had a session with this tutor
    const hasSession = await Session.findOne({
      _id: sessionId,
      studentId: session.user.id,
      tutorId: tutorId,
      status: "completed",
    })

    if (!hasSession) {
      return NextResponse.json(
        { error: "You can only review tutors you've had a completed session with" },
        { status: 403 },
      )
    }

    // Check if the student has already reviewed this session
    const existingReview = await Review.findOne({
      studentId: session.user.id,
      tutorId: tutorId,
      sessionId: sessionId,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this session" }, { status: 409 })
    }

    const newReview = new Review({
      studentId: session.user.id,
      tutorId,
      sessionId,
      rating,
      comment,
      createdAt: new Date(),
    })

    await newReview.save()

    // Update tutor's rating and review count
    const tutorProfile = await TutorProfile.findOne({ userId: tutorId })
    if (tutorProfile) {
      const newReviewCount = tutorProfile.reviewCount + 1
      const newRating = (tutorProfile.rating * tutorProfile.reviewCount + rating) / newReviewCount

      await TutorProfile.findOneAndUpdate(
        { userId: tutorId },
        {
          $inc: { reviewCount: 1 },
          $set: { rating: newRating },
        },
      )
    }

    // Populate the studentId field with name and profileImage
    const populatedReview = await Review.findById(newReview._id).populate("studentId", "name profileImage").lean()

    return NextResponse.json(populatedReview, { status: 201 })
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tutorId = searchParams.get("tutorId")

    if (!tutorId) {
      return NextResponse.json({ error: "Tutor ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const reviews = await Review.find({ tutorId })
      .populate("studentId", "name profileImage")
      .populate("sessionId", "date subject")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

