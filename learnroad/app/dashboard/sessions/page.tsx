"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, Loader2, Video } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Session {
  _id: string
  subject: string
  date: string
  startTime: string
  endTime: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  studentId: {
    name: string
    profileImage: string
  }
  tutorId: {
    name: string
    profileImage: string
  }
  meetingLink: string
}

export default function SessionsPage() {
  const { data: authSession } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/sessions")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log("Fetched sessions:", data)
        setSessions(data)
      } catch (error) {
        console.error("Error fetching sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load sessions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [toast])

  const upcomingSessions = sessions.filter((session) => {
    const sessionDateTime = new Date(`${session.date}T${session.startTime}`)
    return sessionDateTime >= new Date() || session.status === "scheduled" || session.status === "in-progress"
  })

  const pastSessions = sessions.filter((session) => {
    const sessionDateTime = new Date(`${session.date}T${session.startTime}`)
    return sessionDateTime < new Date() || session.status === "completed" || session.status === "cancelled"
  })

  console.log("Upcoming sessions:", upcomingSessions)
  console.log("Past sessions:", pastSessions)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No upcoming sessions</p>
                  <p className="text-sm text-muted-foreground mb-4">You don't have any scheduled sessions yet.</p>
                  <Link href="/dashboard/tutors">
                    <Button>Find a Tutor</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingSessions.map((session) => (
                  <SessionCard key={session._id} session={session} userRole={authSession?.user?.role} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="past" className="space-y-4">
            {pastSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No past sessions</p>
                  <p className="text-sm text-muted-foreground mb-4">You haven't completed any sessions yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pastSessions.map((session) => (
                  <SessionCard key={session._id} session={session} userRole={authSession?.user?.role} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function SessionCard({ session, userRole }: { session: Session; userRole?: string }) {
  const otherUser = userRole === "student" ? session.tutorId : session.studentId

  return (
    <Link href={`/dashboard/sessions/${session._id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
                <AvatarFallback>
                  {otherUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{session.subject}</h3>
                <p className="text-sm text-muted-foreground">with {otherUser.name}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:ml-auto md:items-center gap-2 md:gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{new Date(session.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {session.startTime} - {session.endTime}
                </span>
              </div>
              <Badge variant="outline" className="w-fit">
                {session.status}
              </Badge>
              {session.meetingLink && (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

