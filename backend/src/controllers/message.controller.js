import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { get } from "mongoose";
import { getReceiverSocketId } from "../lib/socket.js";
import { io } from "../lib/socket.js";


export const getUserForSidebar = async(req,res) => {
    try {
        const loggedInId = req.user._id;
        const filterUser = await User.find({_id:{$ne:loggedInId}}).select("-password");
        res.status(200).json(filterUser);

        
    } catch (error) {
        console.log("Error in message controller (getUserForSidebar)",error.message);
        res.status(500).json({message : "Internal server Error"});
        
    }

}

export const getMessage = async (req,res) => {
    try {
        const {id : userToChatId} = req.params // req.params is an object that contain route parameter
        const myId = req.user._id;
        

        const message = await Message.find({
            $or:[
                {senderId:myId,receiverId : userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]
        })
        res.status(200).json(message);
        
    } catch (error) {
        console.log("Error in message controller(getMessage)",error.message);
        res.status(500).json({message : "Internal server Error"});

        
    }

}


export const sendMessage = async (req,res) => {
    try {
        const {text,image} =req.body;
        const {id : receiverId} = req.params;
        const senderId = req.user._id;

        let imageurl;
        if(image){
            const uploadResource = await cloudinary.uploader.upload(image);
            imageurl = uploadResource.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageurl,
        })

        await newMessage.save();
        const receiverSocketId = getReceiverSocketId(receiverId);

        if(receiverSocketId){
            
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }


        // more real time functionality by socket.io

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in massage controller (sendMessage)",error.message);
        res.status(500).json({message : "Internal Server Error"});
    }

}
