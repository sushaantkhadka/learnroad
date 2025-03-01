"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"

const tutorProfileSchema = z.object({
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  teachingStyles: z.array(z.string()).min(1, "At least one teaching style is required"),
  hourlyRate: z.number().min(0, "Hourly rate must be a positive number"),
  bio: z.string().min(10, "Bio must be at least 10 characters long"),
  availability: z
    .array(
      z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .min(1, "At least one availability slot is required"),
})

type TutorProfileData = z.infer<typeof tutorProfileSchema>

const subjectOptions = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "Economics",
  "Psychology",
]

const teachingStyleOptions = [
  "Visual",
  "Auditory",
  "Kinesthetic",
  "Reading/Writing",
  "Problem-based",
  "Discussion-based",
  "Project-based",
  "Inquiry-based",
]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function TutorProfileEdit() {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TutorProfileData>({
    resolver: zodResolver(tutorProfileSchema),
    defaultValues: {
      subjects: [],
      teachingStyles: [],
      hourlyRate: 0,
      bio: "",
      availability: [],
    },
  })

  const {
    fields: subjectFields,
    append: appendSubject,
    remove: removeSubject,
  } = useFieldArray({
    control,
    name: "subjects",
  })

  const {
    fields: styleFields,
    append: appendStyle,
    remove: removeStyle,
  } = useFieldArray({
    control,
    name: "teachingStyles",
  })

  const {
    fields: availabilityFields,
    append: appendAvailability,
    remove: removeAvailability,
  } = useFieldArray({
    control,
    name: "availability",
  })

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        const response = await fetch("/api/tutor-profile")
        if (response.ok) {
          const data = await response.json()
          setValue("subjects", data.subjects)
          setValue("teachingStyles", data.teachingStyles)
          setValue("hourlyRate", data.hourlyRate)
          setValue("bio", data.bio)
          setValue("availability", data.availability)
        }
      } catch (error) {
        console.error("Error fetching tutor profile:", error)
      }
    }

    fetchTutorProfile()
  }, [setValue])

  const onSubmit = async (data: TutorProfileData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tutor-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred while updating the profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {subjectFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Select onValueChange={(value) => setValue(`subjects.${index}`, value)} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => removeSubject(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendSubject("")} className="mt-2">
              Add Subject
            </Button>
          </div>
          {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Styles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {styleFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Select onValueChange={(value) => setValue(`teachingStyles.${index}`, value)} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a teaching style" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachingStyleOptions.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => removeStyle(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendStyle("")} className="mt-2">
              Add Teaching Style
            </Button>
          </div>
          {errors.teachingStyles && <p className="text-red-500 text-sm mt-1">{errors.teachingStyles.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hourly Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Label htmlFor="hourlyRate">$</Label>
            <Input id="hourlyRate" type="number" {...register("hourlyRate", { valueAsNumber: true })} />
          </div>
          {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea className="w-full h-32 p-2 border rounded-md" {...register("bio")}></textarea>
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availabilityFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Select onValueChange={(value) => setValue(`availability.${index}.day`, value)} value={field.day}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="time" {...register(`availability.${index}.startTime`)} className="w-24" />
                <span>to</span>
                <Input type="time" {...register(`availability.${index}.endTime`)} className="w-24" />
                <Button type="button" variant="outline" size="icon" onClick={() => removeAvailability(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendAvailability({ day: "", startTime: "", endTime: "" })}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
          {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  )
}

