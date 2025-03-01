"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function SessionsPage() {
  const { data: session, status } = useSession()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")

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
      year: "numeric",
    })
  }

  const filteredSessions = sessions
    .filter((s) => {
      if (filter === "all") return true
      return s.status === filter
    })
    .filter(
      (s) =>
        s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.student?.name && s.student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.tutor?.name && s.tutor.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date) - new Date(b.date)
      } else if (sortBy === "subject") {
        return a.subject.localeCompare(b.subject)
      }
      return 0
    })

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Sessions</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          type="text"
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-auto"
        />
      </div>

      {loading ? (
        <p>Loading sessions...</p>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No sessions found</p>
          {session?.user?.role === "student" && (
            <Link href="/tutors">
              <Button>Find a Tutor</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session._id}>
              <CardHeader className="pb-2">
                <CardTitle>{session.subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {session.startTime} - {session.endTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.user?.role === "student" ? (
                        <span>Tutor: {session.tutor?.name}</span>
                      ) : (
                        <span>Student: {session.student?.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
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
                        <Button variant="destructive" size="sm" className="flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          Decline
                        </Button>
                      </>
                    )}
                    {session.status === "completed" && session.user?.role === "student" && (
                      <Link href={`/reviews/create?sessionId=${session._id}&tutorId=${session.tutor._id}`}>
                        <Button size="sm">Leave Review</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

