import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { Session } from "@/models/session"
import { User } from "@/models/user"
import { TutorProfile } from "@/models/tutor-profile"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const userId = session.user.id
    const userRole = session.user.role

    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    const sessionsQuery = userRole === "student" ? { studentId: userId } : { tutorId: userId }

    const [totalSessions, recentSessions, upcomingSessions] = await Promise.all([
      Session.countDocuments(sessionsQuery),
      Session.find({ ...sessionsQuery, date: { $gte: oneMonthAgo, $lt: now } })
        .sort({ date: -1 })
        .limit(5)
        .populate(userRole === "student" ? "tutorId" : "studentId", "name profileImage"),
      Session.find({ ...sessionsQuery, date: { $gte: now } })
        .sort({ date: 1 })
        .limit(3)
        .populate(userRole === "student" ? "tutorId" : "studentId", "name profileImage"),
    ])

    const totalHours = recentSessions.reduce((acc, session) => {
      const start = new Date(`${session.date.toDateString()} ${session.startTime}`)
      const end = new Date(`${session.date.toDateString()} ${session.endTime}`)
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)

    let dashboardData: any = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      totalSessions,
      totalHours,
      recentSessions,
      upcomingSessions,
    }

    if (userRole === "student") {
      const tutorsConnected = await Session.distinct("tutorId", { studentId: userId })
      const subjects = await Session.distinct("subject", { studentId: userId })
      dashboardData = {
        ...dashboardData,
        tutorsConnected: tutorsConnected.length,
        subjects: subjects.length,
      }
    } else if (userRole === "tutor") {
      const tutorProfile = await TutorProfile.findOne({ userId })
      if (tutorProfile) {
        dashboardData = {
          ...dashboardData,
          subjects: tutorProfile.subjects,
          totalEarnings: tutorProfile.totalEarnings,
          rating: tutorProfile.rating,
          reviewCount: tutorProfile.reviewCount,
        }
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

