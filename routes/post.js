const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requirelogin = require('../middleware/require_login');

const Post = mongoose.model("Post");


router.get('/allpost', requirelogin, (request, response) => {
    Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then(posts => {
        response.json({posts});
    })
    .catch( err => {
        console.log(err);
    })
});

router.get('/getsubpost',requirelogin,(req,res)=>{

    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/createpost', requirelogin, (request, response) => {
    const {title, body, pic} = request.body;

    if(!title || !body || !pic)
    {
        return response.status(422).json( {error : "Please Add all the fields"} );
    }

    request.user.password = undefined;
    const post = new Post({
        title,
        body,
        photo : pic,
        postedBy : request.user
    });

    post.save().then( result => {
        response.json( {post : result} );
    })
    .catch( err => {
        console.log(err);
    });
});

router.get('/mypost', requirelogin, (request, response) => {
    Post.find( {postedBy : request.user._id} )
    .populate("PostedBy", "_id name")
    .then( mypost => {
        response.json( {mypost} );
    })
    .catch( err => {
        console.log(err);
    });
});

router.put('/like', requirelogin, (request,response)=>{
    Post.findByIdAndUpdate(request.body.postId,{
        $push:{likes:request.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return response.status(422).json({error:err})
        }else{
            response.json(result)
        }
    })
})
router.put('/unlike', requirelogin,(request,response)=>{
    Post.findByIdAndUpdate(request.body.postId,{
        $pull:{likes:request.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return response.status(422).json({error:err})
        }else{
            response.json(result)
        }
    })
})



router.put('/comment',requirelogin,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

router.delete('/deletepost/:postId',requirelogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
              post.remove()
              .then(result=>{
                  res.json(result)
              }).catch(err=>{
                  console.log(err)
              })
        }
    })
})



module.exports = router;