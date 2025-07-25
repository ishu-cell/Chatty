import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io  = new Server(server,{cors : {origin : ["http://localhost:5173"]}});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection",(socket) =>{
    console.log("A user connected");
    console.log(socket.id);
    const userId = socket.handshake.query.userId;
    if(userId){
    userSocketMap[userId] = socket.id;

    }
    // io.emit used to send event to all the collected clients
    io.emit("getOnlineUser",Object.keys(userSocketMap));

    socket.on("disconnect",() => {console.log("A user disconnected",socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUser",Object.keys(userSocketMap));
    });
});
export {io,server,app};