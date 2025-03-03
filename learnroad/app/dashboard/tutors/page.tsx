"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, Filter } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function TutorsPage() {
  const [tutors, setTutors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentSubject, setCurrentSubject] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch(`/api/tutors?subject=${currentSubject !== "all" ? currentSubject : ""}`)
        if (!response.ok) {
          throw new Error("Failed to fetch tutors")
        }
        const data = await response.json()
        setTutors(data.tutors)
      } catch (error) {
        console.error("Error fetching tutors:", error)
        toast({
          title: "Error",
          description: "Failed to load tutors. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutors()
  }, [currentSubject, toast])

  const filteredTutors = tutors.filter(
    (tutor: any) =>
      tutor.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subjects.some((subject: string) => subject.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Find Tutors</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tutors..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4" onValueChange={setCurrentSubject}>
          <TabsList>
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            <TabsTrigger value="Mathematics">Mathematics</TabsTrigger>
            <TabsTrigger value="Science">Science</TabsTrigger>
            <TabsTrigger value="Languages">Languages</TabsTrigger>
            <TabsTrigger value="Programming">Programming</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div>Loading tutors...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTutors.map((tutor: any) => (
                  <Link href={`/dashboard/tutors/${tutor.userId._id}`} key={tutor.userId._id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={tutor.userId.profileImage} alt={tutor.userId.name} />
                              <AvatarFallback>
                                {tutor.userId.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <h3 className="font-semibold">{tutor.userId.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
                                <span>{tutor.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${tutor.hourlyRate}</div>
                              <div className="text-sm text-muted-foreground">per hour</div>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {tutor.subjects.map((subject: string) => (
                              <Badge key={subject} variant="secondary">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          {/* Repeat the TabsContent for other subjects (Mathematics, Science, Languages, Programming) */}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

