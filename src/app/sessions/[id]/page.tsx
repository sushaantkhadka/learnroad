"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageSquare, FileText, Send } from "lucide-react"

export default function SessionPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const sessionId = params.id

  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }

    if (status === "authenticated") {
      fetchSessionData()
      fetchNotes()
      // In a real app, we would set up WebSocket connection here for real-time chat
      // For demo purposes, we'll use mock data
      setMessages([
        {
          id: 1,
          sender: "tutor",
          text: "Hello! Ready for our session today?",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
        {
          id: 2,
          sender: "student",
          text: "Yes, I have some questions prepared about the topic we discussed last time.",
          timestamp: new Date(Date.now() - 1000 * 60 * 4),
        },
        {
          id: 3,
          sender: "tutor",
          text: "Great! Let's start with those questions and then move on to today's material.",
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
        },
      ])
    }
  }, [status])

  const fetchSessionData = async () => {
    try {
      // In a real app, we would fetch the session data from the API
      // For demo purposes, we'll use mock data
      setSessionData({
        _id: sessionId,
        subject: "Mathematics - Calculus",
        date: new Date(),
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        status: "confirmed",
        student: { name: "Alex Johnson", email: "alex@example.com" },
        tutor: { name: "Dr. Sarah Williams", email: "sarah@example.com" },
        meetingLink: "https://meet.example.com/session-123",
      })
    } catch (error) {
      console.error("Error fetching session data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      // In a real app, we would fetch collaborative notes from the API
      // For demo purposes, we'll use mock data
      setNotes(
        "# Session Notes\n\n## Topics Covered\n- Limits and continuity\n- Derivatives and their applications\n- Integration techniques\n\n## Key Formulas\n- Power rule: d/dx(x^n) = nx^(n-1)\n- Product rule: d/dx(f(x)g(x)) = f'(x)g(x) + f(x)g'(x)\n\n## Practice Problems\n1. Find the derivative of f(x) = x^3 + 2x^2 - 5x + 3\n2. Calculate the integral of g(x) = 2x + sin(x)",
      )
    } catch (error) {
      console.error("Error fetching notes:", error)
    }
  }

  const saveNotes = async () => {
    try {
      // In a real app, we would save the notes to the API
      console.log("Saving notes:", notes)
      // Show success message
      alert("Notes saved successfully!")
    } catch (error) {
      console.error("Error saving notes:", error)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const newMsg = {
      id: messages.length + 1,
      sender: session?.user?.role || "student",
      text: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
        <p>Loading session...</p>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
        <p>Session not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{sessionData.subject}</h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(sessionData.date)} • {sessionData.startTime} - {sessionData.endTime}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Join Meeting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Student</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{sessionData.student.name}</p>
            <p className="text-sm text-muted-foreground">{sessionData.student.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tutor</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{sessionData.tutor.name}</p>
            <p className="text-sm text-muted-foreground">{sessionData.tutor.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {sessionData.status.charAt(0).toUpperCase() + sessionData.status.slice(1)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="mb-6">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="notes">Collaborative Notes</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Session Chat</CardTitle>
              <CardDescription>
                Communicate with your {session?.user?.role === "student" ? "tutor" : "student"} in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === session?.user?.role ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === session?.user?.role ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === session?.user?.role ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t mt-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage()
                    }
                  }}
                />
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Collaborative Notes</CardTitle>
              <CardDescription>Take notes together during your session</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                className="flex-1 min-h-[400px] font-mono"
                placeholder="Start taking notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={saveNotes}>
                  <FileText className="mr-2 h-4 w-4" />
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>Interactive Quizzes</CardTitle>
              <CardDescription>Test your knowledge with interactive quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              {session?.user?.role === "tutor" ? (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">Create a New Quiz</h3>
                    <p className="text-muted-foreground mb-4">Create a quiz to test your student's understanding</p>
                    <Button>Create Quiz</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No quizzes available for this session yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

