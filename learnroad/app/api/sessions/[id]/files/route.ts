import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { Session } from "@/models/session"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${Date.now()}-${file.name}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, fileName)
    const fileUrl = `/uploads/${fileName}`

    // Create the uploads directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true })

    await writeFile(filePath, buffer)

    const updatedSession = await Session.findByIdAndUpdate(
      params.id,
      {
        $push: {
          files: {
            name: file.name,
            url: fileUrl,
            uploadedBy: session.user.id,
            uploadedAt: new Date(),
          },
        },
      },
      { new: true },
    ).populate("files.uploadedBy", "name role")

    if (!updatedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const newFile = updatedSession.files[updatedSession.files.length - 1]

    return NextResponse.json(newFile)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

