import mongoose from "mongoose"


export const connectdb = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongo Datebase connected"+conn.connection.host)

    }catch(error){
        console.log("Mongo connection error:",error)
    }
}