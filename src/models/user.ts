import mongoose, { type Document, type Model, Schema } from "mongoose"
import bcrypt from "bcrypt"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "student" | "tutor"
  profileImage?: string
  bio?: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "tutor"],
      required: [true, "Please specify a role"],
    },
    profileImage: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  { timestamps: true },
)

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User

