const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    pic : {
        type:String,
        default:"https://res.cloudinary.com/rajeshjha586/image/upload/v1608207927/igDefaultProfilePic_pjgkym.png"
    },

    followers : [{type:ObjectId, ref:"User"}],
    following : [{type:ObjectId, ref:"User"}]
});


// We not export the model, we just export
mongoose.model('User', userSchema);