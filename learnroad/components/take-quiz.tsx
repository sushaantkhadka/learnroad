"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface QuizQuestion {
  text: string
  options: { text: string; isCorrect: boolean }[]
  type: "multiple-choice" | "true-false" | "short-answer"
}

interface TakeQuizProps {
  quiz: {
    _id: string
    title: string
    description: string
    questions: QuizQuestion[]
  }
  onComplete: (score: number) => void
}

export function TakeQuiz({ quiz, onComplete }: TakeQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(new Array(quiz.questions.length).fill(null))
  const { toast } = useToast()

  const currentQuestion = quiz.questions[currentQuestionIndex]

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answer
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const score = quiz.questions.reduce((acc, question, index) => {
      if (question.type === "short-answer") {
        // For short answer, we'll consider it correct if it's not empty
        return acc + (answers[index] ? 1 : 0)
      } else {
        const correctAnswer = question.options.find((option) => option.isCorrect)?.text
        return acc + (answers[index] === correctAnswer ? 1 : 0)
      }
    }, 0)

    const percentage = (score / quiz.questions.length) * 100
    toast({
      title: "Quiz Completed",
      description: `Your score: ${percentage.toFixed(2)}%`,
    })
    onComplete(score)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{currentQuestion.text}</p>
        {currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false" ? (
          <RadioGroup value={answers[currentQuestionIndex] || ""} onValueChange={handleAnswer}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.text} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Input
            type="text"
            placeholder="Type your answer here"
            value={answers[currentQuestionIndex] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
        <Button onClick={handleNext}>{currentQuestionIndex < quiz.questions.length - 1 ? "Next" : "Submit"}</Button>
      </CardFooter>
    </Card>
  )
}

