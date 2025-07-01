import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import { connectdb } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import {app, server} from "./lib/socket.js"
import path from "path";

dotenv.config();

const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(express.json({ limit: '20mb' }));
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    
}))

app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.all("/*splat", (req, res) => {
    res.status(404).json({ message: "page not found" });
});
}

server.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
    connectdb();
});




//rAPMFLiUw9P24UZB     pass for mongo db 