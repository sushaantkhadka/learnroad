"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, BookOpen, CheckCircle, XCircle, User } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }

    if (status === "authenticated") {
      fetchSessions()
    }
  }, [status])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Avatar className="h-12 w-12">
          <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
          <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter((s) => ["pending", "confirmed"].includes(s.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter((s) => s.status === "completed").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Sessions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter((s) => s.status === "cancelled").length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
          {session?.user?.role === "student" && <TabsTrigger value="find">Find a Tutor</TabsTrigger>}
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled tutoring sessions that are coming up</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading sessions...</p>
              ) : sessions.filter((s) => ["pending", "confirmed"].includes(s.status)).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any upcoming sessions</p>
                  {session?.user?.role === "student" && (
                    <Link href="/tutors">
                      <Button>Find a Tutor</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .filter((s) => ["pending", "confirmed"].includes(s.status))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((session) => (
                      <div key={session._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                          <div>
                            <p className="font-medium">{session.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(session.date)} • {session.startTime} - {session.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.status === "confirmed" && (
                            <Link href={`/sessions/${session._id}`}>
                              <Button size="sm">Join Session</Button>
                            </Link>
                          )}
                          {session.status === "pending" && session.user?.role === "tutor" && (
                            <>
                              <Button size="sm" className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                className="flex items-center gap-1 bg-destructive text-destructive-foreground"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Sessions</CardTitle>
              <CardDescription>Your completed or cancelled tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading sessions...</p>
              ) : sessions.filter((s) => ["completed", "cancelled"].includes(s.status)).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any past sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .filter((s) => ["completed", "cancelled"].includes(s.status))
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((session) => (
                      <div key={session._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                          <div>
                            <p className="font-medium">{session.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(session.date)} • {session.startTime} - {session.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.status === "completed" && session.user?.role === "student" && (
                            <Link href={`/reviews/create?sessionId=${session._id}&tutorId=${session.tutor._id}`}>
                              <Button size="sm">Leave Review</Button>
                            </Link>
                          )}
                          <Link href={`/sessions/${session._id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {session?.user?.role === "student" && (
          <TabsContent value="find">
            <Card>
              <CardHeader>
                <CardTitle>Find a Tutor</CardTitle>
                <CardDescription>Search for tutors based on your learning needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-lg">Subject-Based Search</CardTitle>
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Find tutors who specialize in the subjects you need help with
                      </p>
                      <Link href="/tutors?filter=subject">
                        <Button className="w-full">Browse by Subject</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-lg">Teaching Style Match</CardTitle>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Find tutors whose teaching style matches your learning preferences
                      </p>
                      <Link href="/tutors?filter=teaching-style">
                        <Button className="w-full">Match Teaching Style</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-lg">Availability Search</CardTitle>
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Find tutors who are available when you need them
                      </p>
                      <Link href="/tutors?filter=availability">
                        <Button className="w-full">Search by Availability</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

