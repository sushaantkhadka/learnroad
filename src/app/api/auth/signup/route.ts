import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/user"

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()
    console.log("Received signup data:", { name, email, role })

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const user = new User({ name, email, password, role })
    console.log("User object before save:", user)
    await user.save()
    console.log("User object after save:", user)

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "An error occurred during signup" }, { status: 500 })
  }
}

