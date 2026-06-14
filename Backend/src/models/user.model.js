const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    userName:{
        type: String,
        unique:[true,'Username must be unique'],
        required:[true,'Username is required']
    },
    email:{
        type: String,
        unique:[true,'Email must be unique'],required:[true,"email is required"]
    },
    password:{
        type: String,
        required:[true,"Password is required"]
    }
});
module.exports = mongoose.models.User || mongoose.model('User', userSchema);