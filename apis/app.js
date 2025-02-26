import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";

import authRoutes from "./routes/auth.route.js";

dotenv.config();
const app = express() 

app.use(express.json());

app.listen(3000,() => {
    connectMongoDB()
    console.log("Server Listening on port 3000");
})

app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
    const statusCode= err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode
    })
  })