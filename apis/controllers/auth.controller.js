import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import generateToken from "../utils/generateToken.js";

export const signUp = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return next(errorHandler(400, "Password Do not match"));
    }

    const user = await User.findOne({ username });
    const mail = await User.findOne({ email });

    // console.log(mail);

    if (user) {
      return next(errorHandler(400, "Username already exist"));
    }

    if (mail) {
      return next(errorHandler(400, "Email already exist"));
    }

    const profileImage = `https://avatar.iran.liara.run/public?username=${username}`;

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profileImage: profileImage,
    });

    await newUser.save();
    res.status(201).json({ message: "user created sucessfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const validUser = await User.findOne({ username });
    const validPassword = bcryptjs.compareSync(password, validUser?.password || "");

    if (!validUser || !validPassword) {
      return next(errorHandler(404, "Username or password is incorrect"));
    }

    const { password: hashedPassword, ...rest } = validUser._doc;

    generateToken(validUser._id, res)
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt","", {maxAge:0})
    res.status(200).json({message: "Logged out sucessfully"})
    
  } catch (error) {
    console.log("Error in loggout controller", error.message);
    res.status(500).json({
      error: `Internal Server Error: ${error}`,
    });
  }
};