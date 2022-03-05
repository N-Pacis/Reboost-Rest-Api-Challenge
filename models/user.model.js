import mongoose from "mongoose"
const { Schema, model }= mongoose

import jsonwebtoken from 'jsonwebtoken'
const {sign} = jsonwebtoken

const userSchema = new Schema({
    Username:{
        type:String,
        minLength:3,
        required:true
    },
    Email:{
        type:String,
        minLength:5,
        unique:true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
        required:true
    },
    Password:{
        type:String,
        minLength:6,
        required:true
    },
    NumberOfPosts:{
        type: Number,
        default: 0
    },
    LastLoggedIn:{
        type: Date,
        default: null
    },
    verificationCode:{
        type:String,
        unique: true,
        required: true    
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    passwordResetCode:{
        type: Object,
        default: null
    },
    requestPasswordReset:{
        type: Boolean,
        default: false
    },
    CreatedAt:{
        type:Date,
        default:null
    }
})

userSchema.methods.generateAuthToken = function(){
    const token = sign(
        {_id:this._id,Email: this.Email},
        (process.env.JWT).trim()
    )
    return 'Bearer '+token
}

export const User = model('user',userSchema)
