const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/keys');
const mongoose = require('mongoose');
const User = mongoose.model("User");

module.exports = (request, response, next) => {
    const {authorization} = request.headers;

    //authorization ===> Bearer easfkfllgmb
    if(!authorization)
    {
        return response.status(401).json( {error : "You Must Logged In" } );
    }

    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err)
        {
            return response.status(401).json( {error : "You Must Logged In" } );
        }

        const {_id} = payload;
        User.findById(_id).then(userdata => {
            request.user = userdata;
            next();
        });
    });
};