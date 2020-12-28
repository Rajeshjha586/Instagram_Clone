
const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/keys');

const requirelogin = require('../middleware/require_login');


router.post('/signup', (request, response) => {
    const {name, email, password, pic} = request.body;
    if(!email || !password || !name)
    {
        return response.status(422).json( {error : "Please add all field "});
    }
    
    User.findOne( {email : email} )
    .then( saveUser => {
        if(saveUser)
        {
            return response.status(422).json( {error : "User already exists with that Email ID "}); 
        }

        bcrypt.hash(password, 12)
        .then( hashedpassword => {
            const user = new User({
                name,
                email,
                password : hashedpassword,
                pic
            });
    
            user.save()
            .then( user => {
                response.json( {message : "Saved Successfully"} );
            })
            .catch( err => {
                console.log(err);
            });
        })
    })
    .catch( err => {
        console.log(err);
    })
});

router.post('/signin', (request, response) => {
    const {email, password} = request.body;
    if(!email || !password)
    {
        return response.status(422).json( {error : "Please Enter Your Email or Password"});   
    }

    User.findOne( {email : email})
    .then( savedUser => {
        if(!savedUser)
        {
            return response.status(422).json( {error : "Invalid Email or Password"});            
        }

        bcrypt.compare(password, savedUser.password)
        .then( doMatch => {
            if(doMatch)
            {
                //response.json( {message : "Successfully Singn In"} );

                const token = jwt.sign( {_id : savedUser._id}, JWT_SECRET);
                const {_id, name, email, followers, following, pic} = savedUser;
                response.json( {token, user:{_id, name, email, followers, following, pic}} );
            }
            else
            {
                return response.status(422).json( {error : "Invalid Email or Password"});
            }
        })
        .catch( err => {
            console.log(err);
        })
    })
    .catch( err => {
        console.log(err);
    })
});

module.exports = router;