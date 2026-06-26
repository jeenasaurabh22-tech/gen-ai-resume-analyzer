const userModel=require("../models/user.model");
const blacklistModel=require("../models/blacklist.model");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");


async function regsiterUserController(req,res){
    const {userName,email,password}=req.body;
    if(!userName||!email||!password){
        return res.status(400).json({message:"Username,email and password are required"});
    }
    try{
        const existingUser=await userModel.findOne({$or:[{email:email},{userName:userName}]});
        if(existingUser){
            if(existingUser.email===email){
                return res.status(400).json({message:"User with this email already exists"});
            }
            if(existingUser.userName===userName){
                return res.status(400).json({message:"User with this username already exists"});
            }
            
        }else{
            const hashedPassword=await bcrypt.hash(password,10);
            const newUser=new userModel({userName,email,password:hashedPassword});
            const token=jwt.sign({userId:newUser._id,username:newUser.userName},process.env.JWT_SECRET,{expiresIn:"1d"});
            res.cookie("token",token, {
                httpOnly: true,
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000
            });
            await newUser.save();
            res.status(201).json({message:"User registered successfully",token,user:{id:newUser._id,userName:newUser.userName,email:newUser.email}});
        }
    }catch(error){
        console.error("Error registering user:", error.message);
        console.error("Stack:", error.stack);
        res.status(500).json({message:"Internal server error", error: error.message});
    }
}
async function loginUserController(req,res){
    const {email,password}=req.body;
    if(!email||!password){
        return res.status(400).json({message:"Email and password are required"});
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const token=jwt.sign({userId:user._id,username:user.userName},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.cookie("token",token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({message:"Login successful",token,user:{id:user._id,userName:user.userName,email:user.email}});
    }catch(error){
        console.error("Error logging in user:",error);
        res.status(500).json({message:"Internal server error"});
    }
}
async function logoutUserController(req,res){
    try{
        const token=req.cookies.token;
        if(!token){
            return res.status(400).json({message:"No token found"});
        }
        const blacklist=new blacklistModel({token});
        await blacklist.save();
        res.clearCookie("token");
        res.status(200).json({message:"Logout successful"});
    }catch(error){
        console.error("Error logging out user:",error);
        res.status(500).json({message:"Internal server error"});
    }
}
async function getMeController(req,res){
    try{
        const user=await userModel.findById(req.user.userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        return res.status(200).json({user:{id:user._id,userName:user.userName,email:user.email}});
    }
    catch(error){
        console.error("Error fetching user data:",error);
        res.status(500).json({message:"Internal server error"});
    }
}


module.exports={regsiterUserController,loginUserController,logoutUserController,getMeController};