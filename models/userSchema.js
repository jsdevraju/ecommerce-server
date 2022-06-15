import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true, `Username is required`],
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:[true, `Email is required`],
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:[true, `Password is required`],
        trim:true
    },
    verifyCode:{
        type:String,
        trim:true,
        default:""
    },
    isVerified:{
        type:Boolean,
        enum:[true, false],
        default:false
    },
    avatar:{
        type:String,
        default:"https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    },
    role:{
        type:String,
        enum:['user', 'admin'],
        default:"user"
    }
})


export default mongoose.model('User', userSchema);