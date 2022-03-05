import mongoose from "mongoose"
const { Schema, model }= mongoose

const postSchema = new Schema({
    body:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "user",
        required:true
    },
    category:{
        type:String,
        required:true
    },
    CreatedAt:{
        type:Date,
        default:null
    }
})

export const Post = model('post',postSchema)
