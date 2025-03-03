import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createReadStream } from "fs"
import { join } from "path"

export async function GET(request: Request, { params }: { params: { fileUrl: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedFileUrl = decodeURIComponent(params.fileUrl)
    const filePath = join(process.cwd(), "public", decodedFileUrl)

    const fileStream = createReadStream(filePath)
    const fileName = decodedFileUrl.split("/").pop()

    return new NextResponse(fileStream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream",
      },
    })
  } catch (error) {
    console.error("Error handling file download:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

