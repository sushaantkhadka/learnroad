import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    tutor: {
        type: Boolean,
        default: false,
    },
    username: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    profileImage: {
        type: String,
        default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
