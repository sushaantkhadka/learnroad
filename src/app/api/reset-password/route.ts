import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import connectDB from "@/lib/db"
import User from "@/models/user"

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json()

    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    await user.save()

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "An error occurred while resetting the password" }, { status: 500 })
  }
}

