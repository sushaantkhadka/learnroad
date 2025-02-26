import mongoose from "mongoose";

const connectMongoDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB);
        console.log("Database connection established");
        
    } catch (err) {
        console.log(err);
    }
}

export default connectMongoDB;