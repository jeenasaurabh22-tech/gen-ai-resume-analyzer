const jwt=require("jsonwebtoken");
function authUser(req,res,next){
    let token=req.cookies.token;
    
    if(!token && req.headers.authorization){
        const authHeader=req.headers.authorization;
        if(authHeader.startsWith("Bearer ")){
            token=authHeader.slice(7);
        }
    }
    
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch(error){
        return res.status(401).json({message:"Invalid token"});
    }
}
module.exports={authUser};