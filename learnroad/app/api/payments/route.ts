import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { Payment } from "@/models/payment"
import { Session } from "@/models/session"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { sessionId, amount, paymentMethod, cardDetails } = await request.json()

    if (!sessionId || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required payment information" }, { status: 400 })
    }

    // Simulate payment processing
    const isPaymentSuccessful = Math.random() < 0.9 // 90% success rate

    if (!isPaymentSuccessful) {
      return NextResponse.json({ error: "Payment failed" }, { status: 400 })
    }

    // Create a new payment record
    const payment = new Payment({
      sessionId,
      studentId: session.user.id,
      tutorId: (await Session.findById(sessionId)).tutorId,
      amount,
      currency: "USD",
      status: "completed",
      paymentMethod,
      transactionId: `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date(),
    })

    await payment.save()

    // Update the session status to paid
    await Session.findByIdAndUpdate(sessionId, { paymentStatus: "paid" })

    return NextResponse.json({ message: "Payment processed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

