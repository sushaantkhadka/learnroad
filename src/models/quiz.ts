import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IQuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

export interface IQuiz extends Document {
  session: mongoose.Types.ObjectId
  title: string
  questions: IQuizQuestion[]
  createdBy: mongoose.Types.ObjectId
}

const QuizSchema = new Schema<IQuiz>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
        },
        correctAnswer: {
          type: Number,
          required: true,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema)

export default Quiz

