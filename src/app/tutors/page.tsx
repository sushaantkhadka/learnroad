"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Search, BookOpen, GraduationCap, Clock } from "lucide-react";

export default function TutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [teachingStyleFilter, setTeachingStyleFilter] = useState("");

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        let url = "/api/tutors";
        const params = new URLSearchParams();

        if (subjectFilter) {
          params.append("subject", subjectFilter);
        }

        if (teachingStyleFilter) {
          params.append("teachingStyle", teachingStyleFilter);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        
        setTutors(data);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [subjectFilter, teachingStyleFilter]);

  const filteredTutors = tutors.filter((tutor) => {
    const tutorName = tutor.name?.toLowerCase() || "";
    const subjects = tutor.subjects?.join(" ").toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    return tutorName.includes(searchLower) || subjects.includes(searchLower);
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Find Your Perfect Tutor</h1>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>Refine your tutor search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or subject"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Subject Filter */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Select
                  value={subjectFilter}
                  onValueChange={(value) =>
                    setSubjectFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Computer Science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Teaching Style Filter */}
              <div className="space-y-2">
                <label htmlFor="teaching-style" className="text-sm font-medium">
                  Teaching Style
                </label>
                <Select
                  value={teachingStyleFilter}
                  onValueChange={(value) =>
                    setTeachingStyleFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="teaching-style">
                    <SelectValue placeholder="Any Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Style</SelectItem>
                    <SelectItem value="Visual">Visual</SelectItem>
                    <SelectItem value="Auditory">Auditory</SelectItem>
                    <SelectItem value="Hands-on">Hands-on</SelectItem>
                    <SelectItem value="Problem-based">Problem-based</SelectItem>
                    <SelectItem value="Discussion-based">
                      Discussion-based
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutors List */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading tutors...</p>
            </div>
          ) : filteredTutors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-lg mb-2">
                No tutors found matching your criteria
              </p>
              <p className="text-muted-foreground">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTutors.map((tutor) => (
                <Card key={tutor.user._id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{tutor.user.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {tutor.subjects?.slice(0, 2).join(", ")}
                          {tutor.subjects?.length > 2 && "..."}
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">
                          {tutor.averageRating?.toFixed(1) || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({tutor.totalReviews || 0})
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tutor.teachingStyles?.map((style) => (
                        <Badge
                          key={`${tutor.id}-${style}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {style}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>${tutor.hourlyRate}/hour</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{tutor.education}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {tutor.availability?.length || 0} available time slots
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/tutors/${tutor.user._id}`} className="w-full">
                      <Button className="w-full">View Profile</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
