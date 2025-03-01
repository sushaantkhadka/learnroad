"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "tutor"], {
    required_error: "Please select a role",
  }),
})

type SignupData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupData) => {
    setIsLoading(true)
    console.log("Signup data:", data)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Signup successful")
        router.push("/login")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Signup failed")
      }
    } catch (error) {
      toast.error("An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label>Role</Label>
        {/* <RadioGroup defaultValue="student">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="student" id="student" {...register("role")} />
            <Label htmlFor="student">Student</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tutor" id="tutor" {...register("role")} />
            <Label htmlFor="tutor">Tutor</Label>
          </div>
        </RadioGroup> */}
        <Controller
          name="role"
          control={control}
          defaultValue="student"
          render={({ field }) => (
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tutor" id="tutor" />
                <Label htmlFor="tutor">Tutor</Label>
              </div>
            </RadioGroup>
          )}
        />
        {errors.role && (
          <p className="text-red-500 text-sm">{errors.role.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign up"}
      </Button>
    </form>
  );
}

