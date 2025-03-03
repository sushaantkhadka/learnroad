import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { Session } from "@/models/session"
import { Payment } from "@/models/payment"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const tutorId = session.user.id

    // Calculate total earnings from completed sessions
    const totalEarnings = await Session.aggregate([
      { $match: { tutorId: new mongoose.Types.ObjectId(tutorId), status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ])

    // Calculate withdrawn earnings
    const withdrawals = await Payment.aggregate([
      { $match: { tutorId: new mongoose.Types.ObjectId(tutorId), type: "withdrawal", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const totalEarningsAmount = totalEarnings[0]?.total || 0
    const withdrawnAmount = withdrawals[0]?.total || 0
    const availableBalance = totalEarningsAmount - withdrawnAmount

    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const completedSessions = await Session.find({
      tutorId: session.user.id,
      status: "completed",
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: -1 })

    const recentPayments = await Payment.find({
      tutorId: session.user.id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .limit(10)

    const earningsData = {
      totalEarnings: totalEarningsAmount,
      availableBalance: availableBalance,
      monthlyEarnings: completedSessions.reduce((total, session) => total + session.price, 0),
      completedSessions,
      recentPayments,
    }

    return NextResponse.json(earningsData)
  } catch (error) {
    console.error("Error fetching earnings data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 })
    }

    const tutorId = session.user.id

    // Calculate total earnings and withdrawals
    const [totalEarnings, withdrawals] = await Promise.all([
      Session.aggregate([
        { $match: { tutorId: new mongoose.Types.ObjectId(tutorId), status: "completed" } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
      Payment.aggregate([
        { $match: { tutorId: new mongoose.Types.ObjectId(tutorId), type: "withdrawal", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ])

    const totalEarningsAmount = totalEarnings[0]?.total || 0
    const withdrawnAmount = withdrawals[0]?.total || 0
    const availableBalance = totalEarningsAmount - withdrawnAmount

    if (amount > availableBalance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Create a new payment record for the withdrawal
    const withdrawal = new Payment({
      tutorId: tutorId,
      studentId: tutorId, // Set to tutorId as it's a withdrawal
      amount: amount,
      status: "completed",
      type: "withdrawal",
      createdAt: new Date(),
    })

    await withdrawal.save()

    // Calculate new available balance
    const newAvailableBalance = availableBalance - amount

    return NextResponse.json(
      {
        message: "Withdrawal successful",
        newAvailableBalance: newAvailableBalance,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error processing withdrawal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

