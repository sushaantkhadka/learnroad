"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, FileUp, LinkIcon, Loader2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TakeQuiz } from "@/components/take-quiz"

interface Session {
  _id: string
  subject: string
  date: string
  startTime: string
  endTime: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  meetingLink: string
  studentId: {
    _id: string
    name: string
    profileImage: string
  }
  tutorId: {
    _id: string
    name: string
    profileImage: string
  }
  files: {
    _id: string
    name: string
    url: string
    uploadedBy: {
      _id: string
      name: string
      role: string
    }
    uploadedAt: string
  }[]
}

interface Quiz {
  _id: string
  title: string
  description: string
  questions: {
    text: string
    options: { text: string; isCorrect: boolean }[]
    type: "multiple-choice" | "true-false" | "short-answer"
  }[]
  isPublished: boolean
}

export default function SessionDetailsPage() {
  const params = useParams()
  const { data: authSession } = useSession()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<string>("")
  const [meetingLink, setMeetingLink] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false)
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [quizQuestions, setQuizQuestions] = useState<Quiz["questions"]>([])
  const { toast } = useToast()
  const [isTakingQuiz, setIsTakingQuiz] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(`/api/sessions/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch session details")
        }
        const data = await response.json()
        setSession(data)
        setNewStatus(data.status)
        setMeetingLink(data.meetingLink)
      } catch (error) {
        console.error("Error fetching session details:", error)
        toast({
          title: "Error",
          description: "Failed to load session details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/sessions/${params.id}/quiz`)
        if (response.ok) {
          const data = await response.json()
          setQuiz(data)
          setQuizTitle(data.title)
          setQuizDescription(data.description)
          setQuizQuestions(data.questions)
        }
      } catch (error) {
        console.error("Error fetching quiz:", error)
      }
    }

    fetchSessionDetails()
    fetchQuiz()
  }, [params.id, toast])

  const handleStatusChange = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update session status")
      }

      setSession((prevSession) => (prevSession ? { ...prevSession, status: newStatus as Session["status"] } : null))
      toast({
        title: "Status updated",
        description: "The session status has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating session status:", error)
      toast({
        title: "Error",
        description: "Failed to update session status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMeetingLinkUpdate = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingLink }),
      })

      if (!response.ok) {
        throw new Error("Failed to update meeting link")
      }

      setSession((prevSession) => (prevSession ? { ...prevSession, meetingLink } : null))
      toast({
        title: "Meeting link updated",
        description: "The meeting link has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating meeting link:", error)
      toast({
        title: "Error",
        description: "Failed to update meeting link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/sessions/${params.id}/files`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const newFile = await response.json()
      setSession((prevSession) => (prevSession ? { ...prevSession, files: [...prevSession.files, newFile] } : null))
      toast({
        title: "File uploaded",
        description: "The file has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileDownload = async (fileUrl: string) => {
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fileUrl)}`)
      if (!response.ok) {
        throw new Error("Failed to download file")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = fileUrl.split("/").pop() || "download"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateQuiz = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/quiz`, {
        method: quiz ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quizTitle,
          description: quizDescription,
          questions: quizQuestions,
          isPublished: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create/update quiz")
      }

      const updatedQuiz = await response.json()
      setQuiz(updatedQuiz)
      setIsQuizDialogOpen(false)
      toast({
        title: quiz ? "Quiz updated" : "Quiz created",
        description: `The quiz has been ${quiz ? "updated" : "created"} successfully.`,
      })
    } catch (error) {
      console.error("Error creating/updating quiz:", error)
      toast({
        title: "Error",
        description: "Failed to create/update quiz. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePublishQuiz = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/quiz`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...quiz,
          isPublished: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to publish quiz")
      }

      const updatedQuiz = await response.json()
      setQuiz(updatedQuiz)
      toast({
        title: "Quiz published",
        description: "The quiz has been published successfully.",
      })
    } catch (error) {
      console.error("Error publishing quiz:", error)
      toast({
        title: "Error",
        description: "Failed to publish quiz. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        text: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        type: "multiple-choice",
      },
    ])
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...quizQuestions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuizQuestions(updatedQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...quizQuestions]
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    }
    setQuizQuestions(updatedQuestions)
  }

  const handleQuizComplete = async (score: number) => {
    setIsTakingQuiz(false)
    // Here you would typically send the score to your backend
    // For now, we'll just log it and show a toast
    console.log("Quiz completed with score:", score)
    toast({
      title: "Quiz Completed",
      description: `You've completed the quiz! Your answers have been submitted.`,
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Session not found.</p>
        </div>
      </DashboardLayout>
    )
  }

  const isStudent = authSession?.user?.role === "student"
  const isTutor = authSession?.user?.role === "tutor"

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Session Details</h2>
          <Badge variant="outline" className="text-lg">
            {session.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={isStudent ? session.tutorId.profileImage : session.studentId.profileImage}
                  alt={isStudent ? session.tutorId.name : session.studentId.name}
                />
                <AvatarFallback>
                  {(isStudent ? session.tutorId.name : session.studentId.name)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{session.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  with {isStudent ? session.tutorId.name : session.studentId.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{new Date(session.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>
                {session.startTime} - {session.endTime}
              </span>
            </div>
          </CardContent>
        </Card>

        {isTutor && (
          <Card>
            <CardHeader>
              <CardTitle>Update Session Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStatusChange}>Update Status</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Meeting Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {session.meetingLink || "No meeting link set"}
              </a>
            </div>
            {isTutor && (
              <div className="space-y-2">
                <Input
                  placeholder="Enter new meeting link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
                <Button onClick={handleMeetingLinkUpdate}>Update Meeting Link</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.files.length === 0 ? (
              <p>No files have been shared yet.</p>
            ) : (
              <ul className="space-y-2">
                {session.files.map((file) => (
                  <li key={file._id} className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                    <div className="flex items-center gap-2">
                      <FileUp className="h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium">{file.name}</span>
                        <span className="text-sm text-muted-foreground">
                          Uploaded by {file.uploadedBy.name} ({file.uploadedBy.role})
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleFileDownload(file.url)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0])
                  }
                }}
              />
              <Button onClick={() => fileInputRef.current?.click()}>Upload File</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            {isTutor ? (
              <>
                {quiz ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <p>{quiz.description}</p>
                    <p>Number of questions: {quiz.questions.length}</p>
                    <div className="flex gap-4">
                      <Button onClick={() => setIsQuizDialogOpen(true)}>Edit Quiz</Button>
                      {!quiz.isPublished && <Button onClick={handlePublishQuiz}>Publish Quiz</Button>}
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setIsQuizDialogOpen(true)}>Create Quiz</Button>
                )}
              </>
            ) : (
              <>
                {quiz && quiz.isPublished ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <p>{quiz.description}</p>
                    <Button onClick={() => setIsTakingQuiz(true)}>Take Quiz</Button>
                  </div>
                ) : (
                  <p>No quiz available for this session yet.</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{quiz ? "Edit Quiz" : "Create Quiz"}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4">
                <Input placeholder="Quiz Title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
                <Textarea
                  placeholder="Quiz Description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                />
                {quizQuestions.map((question, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-2">
                      <Input
                        placeholder="Question"
                        value={question.text}
                        onChange={(e) => updateQuestion(index, "text", e.target.value)}
                      />
                      <Select value={question.type} onValueChange={(value) => updateQuestion(index, "type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="short-answer">Short Answer</SelectItem>
                        </SelectContent>
                      </Select>
                      {question.type !== "short-answer" && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                placeholder={`Option ${optionIndex + 1}`}
                                value={option.text}
                                onChange={(e) => updateOption(index, optionIndex, "text", e.target.value)}
                              />
                              <Checkbox
                                checked={option.isCorrect}
                                onCheckedChange={(checked) => updateOption(index, optionIndex, "isCorrect", checked)}
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() =>
                              updateQuestion(index, "options", [...question.options, { text: "", isCorrect: false }])
                            }
                          >
                            Add Option
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addQuestion}>Add Question</Button>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsQuizDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuiz}>{quiz ? "Update Quiz" : "Create Quiz"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTakingQuiz} onOpenChange={setIsTakingQuiz}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Take Quiz</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow">
              {quiz && <TakeQuiz quiz={quiz} onComplete={handleQuizComplete} />}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

