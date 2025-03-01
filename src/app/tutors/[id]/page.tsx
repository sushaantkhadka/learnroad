"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Star, Clock, GraduationCap, BookOpen, MessageSquare } from "lucide-react"
import { Chat } from "@/components/chat"

export default function TutorProfilePage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [chatDialogOpen, setChatDialogOpen] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/tutors/${id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTutor(data)
      } catch (error) {
        console.error("Error fetching tutor profile:", error)
        setError("Failed to load tutor profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTutorProfile()
    }
  }, [id])

  useEffect(() => {
    if (selectedDate && tutor) {
      const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" })
      const slotsForDay = tutor.availability.filter((slot) => slot.day === dayOfWeek)
      setAvailableTimeSlots(slotsForDay.map((slot) => `${slot.startTime} - ${slot.endTime}`))
    } else {
      setAvailableTimeSlots([])
    }
  }, [selectedDate, tutor])

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedSubject) {
      toast.error("Please select a date, time slot, and subject")
      return
    }

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: id,
          date: selectedDate.toISOString(),
          timeSlot: selectedTimeSlot,
          subject: selectedSubject,
        }),
      })

      if (response.ok) {
        toast.success("Session booked successfully")
        setBookingDialogOpen(false)
        setSelectedDate(null)
        setSelectedTimeSlot("")
        setSelectedSubject("")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to book session")
      }
    } catch (error) {
      console.error("Error booking session:", error)
      toast.error("An error occurred while booking the session")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading tutor profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-screen">
        <p className="text-xl">Tutor not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-8 pt-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src={tutor.profileImage} alt={tutor.name} />
            <AvatarFallback>{tutor.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{tutor.name}</h1>
            <p className="text-muted-foreground mb-4">{tutor.bio}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {tutor.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-semibold">{tutor.averageRating?.toFixed(1) || "N/A"}</span>
                <span className="text-muted-foreground ml-1">({tutor.totalReviews || 0} reviews)</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-muted-foreground mr-1" />
                <span>${tutor.hourlyRate}/hour</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <GraduationCap className="w-5 h-5 text-muted-foreground mr-1" />
                <span>{tutor.education}</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-muted-foreground mr-1" />
                <span>{tutor.experience} years experience</span>
              </div>
            </div>
          </div>
          {session?.user?.role === "student" && (
            <div className="flex flex-col gap-4">
              <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-blue-500 text-white">Book a Session</Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Book a Session with {tutor.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="subject">Select a subject:</label>
                      <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {tutor.subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="date">Select a date:</label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date)
                          setSelectedTimeSlot("")
                        }}
                        className="rounded-md border"
                        disabled={(date) =>
                          date < new Date() ||
                          date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ||
                          !tutor.availability.some(
                            (slot) => slot.day === date.toLocaleDateString("en-US", { weekday: "long" }),
                          )
                        }
                      />
                    </div>
                    {selectedDate && (
                      <div className="grid gap-2">
                        <label htmlFor="timeSlot">Select a time slot:</label>
                        <Select onValueChange={setSelectedTimeSlot} value={selectedTimeSlot}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleBookSession} disabled={!selectedDate || !selectedTimeSlot || !selectedSubject}>
                    Book Session
                  </Button>
                </DialogContent>
              </Dialog>
              <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Chat with {tutor.name}</DialogTitle>
                  </DialogHeader>
                  <Chat recipientId={tutor.id} recipientName={tutor.name} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tutor.teachingStyles?.map((style) => (
              <Badge key={style} variant="secondary">
                {style}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

