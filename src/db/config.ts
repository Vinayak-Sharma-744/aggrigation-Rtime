import mongoose from "mongoose";
export const connectDB = async () => {

    try {

        const connection = await mongoose.connect(`${process.env.MONGO_URL as string}`)

        console.log("Db connected", connection.connection.host)

    } catch (error) {

        console.log("No Db connected", error)

        process.exit(1)
    }
}
