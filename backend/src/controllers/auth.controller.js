import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const  signup = async function (req,res){ 
    const {fullName,email,password} = req.body
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message : "Please fill all the detail"});
        }
        if(password.length<6){
            return res.status(400).json({message : "Password must be atleast 6 character"});
        }
        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message : "email is already registered"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password : hashedPassword
        });

        if(newUser){
            // generate jwt token
            generateToken(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });


        }else{
            return res.status(400).json({message : "Invalid user data"});
        }

        
    } catch (error) {
        console.log("Error in signup controller",error.message);
        res.status(500).json({message : "Internal Server Error"});
        
    }
}

export const login = async (req,res) => {
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email});
        if(user){
            const isPasswordCorrect = await bcrypt.compare(password,user.password);
            if(!isPasswordCorrect){
                return res.status(400).json({message : "Password incorrect"});

            }
            generateToken(user._id,res);

            res.status(200).json({
                _id:user._id,
                fullName:user.fullName,
                email:user.email,
                profilePic:user.profilePic,
            });

        }else{

            return res.status(400).json({message : "email not registered. Please Sign Up!"})
        }
        
    } catch (error) {
        console.log("Error in login ",error.message);
        res.status(500).json({message : "Internal Server Error"});
        
    }
}
export const logout = (req,res) => {
    try {
        res.cookie("jwt","",{maxAge : 0});
        res.status(200).json({message : "Logout succesfully"});
        
    } catch (error) {
        console.log("Error in logout ",error.message);
        res.status(500).json({message : "Internal Server Error"});
    }
} 

export const updateProfile = async(req,res) => {
    try{const {profilePic} = req.body;
    const userId = req.user._id;

    if(!profilePic){
        return req.status(400).json({message : "Profile Pic is required"});
    }
    const uploadresponse = await cloudinary.uploader.upload(profilePic);
    const updateduser = await User.findByIdAndUpdate(
        userId,
        {profilePic : uploadresponse.secure_url},
        {new : true}
    );
    res.status(200).json(updateduser);
}catch(error){
    console.log("error in update",error.message);
    res.status(500).json({message : "Internal Server Error"});
}

    
}

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth ",error.message);
        res.status(500).json({message : "Internal Server error"})
        
    }
}