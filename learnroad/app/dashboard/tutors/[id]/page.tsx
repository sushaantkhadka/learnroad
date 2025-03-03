"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Star, MessageSquare, CalendarIcon, Clock, Loader2, CreditCard } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Tutor {
  userId: {
    _id: string
    name: string
    email: string
    profileImage: string
  }
  subjects: string[]
  rating: number
  reviewCount: number
  hourlyRate: number
  bio: string
  teachingStyle: string
  availability: {
    day: string
    startTime: string
    endTime: string
  }[]
}

interface Review {
  _id: string
  studentId: {
    name: string
    profileImage: string
  }
  rating: number
  comment: string
  createdAt: string
}

interface Session {
  _id: string
  date: string
  subject: string
  // ... other session properties
}

export default function TutorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState<string | undefined>(undefined)
  const [subject, setSubject] = useState<string | undefined>(undefined)
  const [message, setMessage] = useState("")
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card")
  const [cardNumber, setCardNumber] = useState<string>("")
  const [cardExpiry, setCardExpiry] = useState<string>("")
  const [cardCVC, setCardCVC] = useState<string>("")
  const [completedSessions, setCompletedSessions] = useState<Session[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        const response = await fetch(`/api/tutors/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch tutor details")
        }
        const data = await response.json()
        setTutor(data.tutor)
        setReviews(data.reviews)
      } catch (error) {
        console.error("Error fetching tutor details:", error)
        toast({
          title: "Error",
          description: "Failed to load tutor details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutorDetails()
  }, [params.id, toast])

  useEffect(() => {
    const fetchCompletedSessions = async () => {
      if (!tutor) return
      try {
        const response = await fetch(`/api/sessions?tutorId=${tutor.userId._id}&status=completed`)
        if (!response.ok) {
          throw new Error("Failed to fetch completed sessions")
        }
        const data = await response.json()
        setCompletedSessions(data)
      } catch (error) {
        console.error("Error fetching completed sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load completed sessions. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchCompletedSessions()
  }, [tutor, toast])

  const handleBookSession = () => {
    if (!date || !timeSlot || !subject) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a date, time slot, and subject for your session.",
      })
      return
    }

    setIsBookingDialogOpen(false)
    setIsPaymentDialogOpen(true)
  }

  const handlePayment = async () => {
    if (!date || !timeSlot || !subject) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a date, time slot, and subject for your session.",
      })
      return
    }

    if (paymentMethod === "credit_card" && (!cardNumber || !cardExpiry || !cardCVC)) {
      toast({
        variant: "destructive",
        title: "Missing payment information",
        description: "Please enter all required credit card details.",
      })
      return
    }

    try {
      const sessionResponse = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId: tutor?.userId._id,
          subject,
          date: date?.toISOString(),
          startTime: timeSlot?.split("-")[0].trim(),
          endTime: timeSlot?.split("-")[1].trim(),
          price: tutor?.hourlyRate,
        }),
      })

      if (!sessionResponse.ok) {
        throw new Error("Failed to book session")
      }

      const sessionData = await sessionResponse.json()

      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionData._id,
          amount: tutor?.hourlyRate,
          paymentMethod,
          cardDetails: paymentMethod === "credit_card" ? { cardNumber, cardExpiry, cardCVC } : undefined,
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error("Failed to process payment")
      }

      setIsPaymentDialogOpen(false)
      toast({
        title: "Session booked successfully!",
        description: `Your session with ${tutor?.userId.name} has been scheduled and paid for.`,
      })
      router.push("/dashboard/sessions")
    } catch (error) {
      console.error("Error booking session or processing payment:", error)
      toast({
        title: "Booking failed",
        description: "There was an error booking your session or processing the payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Empty message",
        description: "Please enter a message to send.",
      })
      return
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: tutor?.userId._id,
          content: message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setIsMessageDialogOpen(false)
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${tutor?.userId.name}.`,
      })
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Message failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitReview = async () => {
    if (reviewRating === 0 || !selectedSessionId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a rating and a session for your review.",
      })
      return
    }

    try {
      setIsSubmittingReview(true)
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId: tutor?.userId._id,
          sessionId: selectedSessionId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit review")
      }

      const newReview = await response.json()

      setIsReviewDialogOpen(false)
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      })

      // Update the reviews list with the new review
      setReviews([newReview, ...reviews])

      // Update the tutor's rating and review count
      if (tutor) {
        const newReviewCount = tutor.reviewCount + 1
        const newRating = (tutor.rating * tutor.reviewCount + reviewRating) / newReviewCount
        setTutor({
          ...tutor,
          rating: newRating,
          reviewCount: newReviewCount,
        })
      }

      setReviewRating(0)
      setReviewComment("")
      setSelectedSessionId(null)
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Review submission failed",
        description:
          error instanceof Error ? error.message : "There was an error submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReview(false)
    }
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

  if (!tutor) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Tutor not found.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={tutor.userId.profileImage} alt={tutor.userId.name} />
              <AvatarFallback>
                {tutor.userId.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{tutor.userId.name}</h2>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(tutor.rating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">
                  {tutor.rating.toFixed(1)} ({tutor.reviewCount} reviews)
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tutor.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send a message to {tutor.userId.name}</DialogTitle>
                  <DialogDescription>Your message will be delivered to the tutor's inbox.</DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage}>Send Message</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Book Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book a Session</DialogTitle>
                  <DialogDescription>
                    Select a date, time, and subject for your session with {tutor.userId.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                  </div>
                  <div className="grid gap-2">
                    <Select onValueChange={setTimeSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.availability.map((slot) => (
                          <SelectItem
                            key={`${slot.day}-${slot.startTime}`}
                            value={`${slot.startTime} - ${slot.endTime}`}
                          >
                            {slot.day} - {slot.startTime} to {slot.endTime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Select onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBookSession}>Continue to Payment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Payment</DialogTitle>
                  <DialogDescription>
                    Review your session details and complete payment to book your session.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="rounded-lg border p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Tutor:</div>
                      <div>{tutor?.userId.name}</div>
                      <div className="text-muted-foreground">Subject:</div>
                      <div>{subject}</div>
                      <div className="text-muted-foreground">Date & Time:</div>
                      <div>
                        {date?.toLocaleDateString()} - {timeSlot}
                      </div>
                      <div className="text-muted-foreground">Duration:</div>
                      <div>1 hour</div>
                      <div className="text-muted-foreground">Rate:</div>
                      <div>${tutor?.hourlyRate}/hour</div>
                      <div className="text-muted-foreground font-medium">Total:</div>
                      <div className="font-medium">${tutor?.hourlyRate}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {paymentMethod === "credit_card" && (
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="card-expiry">Expiry Date</Label>
                          <Input
                            id="card-expiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="card-cvc">CVC</Label>
                          <Input
                            id="card-cvc"
                            placeholder="123"
                            value={cardCVC}
                            onChange={(e) => setCardCVC(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {paymentMethod === "paypal" && (
                    <div className="rounded-lg border p-4 flex items-center justify-center">
                      <p>You will be redirected to PayPal to complete your payment.</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePayment}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ${tutor?.hourlyRate}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Star className="mr-2 h-4 w-4" />
                  Leave Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave a Review for {tutor?.userId.name}</DialogTitle>
                  <DialogDescription>Share your experience with this tutor.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="session">Select Session</Label>
                    <Select onValueChange={(value) => setSelectedSessionId(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a session" />
                      </SelectTrigger>
                      <SelectContent>
                        {completedSessions.map((session) => (
                          <SelectItem key={session._id} value={session._id}>
                            {new Date(session.date).toLocaleDateString()} - {session.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          type="button"
                          variant={star <= reviewRating ? "default" : "outline"}
                          size="icon"
                          onClick={() => setReviewRating(star)}
                        >
                          <Star className={`h-4 w-4 ${star <= reviewRating ? "fill-primary" : ""}`} />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your thoughts about the tutor..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReview} disabled={isSubmittingReview || !selectedSessionId}>
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <div className="md:col-span-5 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About {tutor.userId.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">{tutor.bio}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Teaching Style</h3>
                  <p className="text-sm text-muted-foreground">{tutor.teachingStyle}</p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="reviews">
              <TabsList>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>See what other students are saying about {tutor.userId.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{review.studentId.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Availability</CardTitle>
                    <CardDescription>{tutor.userId.name}'s regular teaching hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tutor.availability.map((slot) => (
                        <div
                          key={`${slot.day}-${slot.startTime}`}
                          className="flex flex-col sm:flex-row sm:items-center gap-2"
                        >
                          <div className="font-medium min-w-[100px]">{slot.day}</div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {slot.startTime} - {slot.endTime}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${tutor.hourlyRate}</div>
                <p className="text-sm text-muted-foreground">per hour</p>
                <Button className="w-full mt-4" onClick={() => setIsBookingDialogOpen(true)}>
                  Book a Session
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {tutor.subjects.map((subject) => (
                    <div key={subject} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{subject}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

