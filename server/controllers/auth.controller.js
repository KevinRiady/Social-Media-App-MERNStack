// handle reqs to signin and sign out routes,
// provide JWT and express-jwt functionalities
// enabling authentication and authorization for protected user API endpoints

import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from './../../config/config'

// yarn add jsonwebtoken to install the jsonwebtoken module
const signin = async (req, res) => {
    try {
      let user = await User.findOne({
        "email": req.body.email
      })
      if (!user)
        return res.status('401').json({
          error: "User not found"
        })
  
      if (!user.authenticate(req.body.password)) {
        return res.status('401').send({
          error: "Email and password don't match."
        })
      }
  
      const token = jwt.sign({
        _id: user._id
      }, config.jwtSecret)
  
      res.cookie("t", token, {
        expire: new Date() + 9999
      })
  
      return res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      })
  
    } catch (err) {
  
      return res.status('401').json({
        error: "Could not sign in"
      })
  
    }
  }
  
// this function clears the response cookie containing the signed JWT.
const signout = (req, res) => {
    res.clearCookie("t")
    return res.status('200').json({
        message: "Signed Out"
    })
}

const requireSignin = expressJwt({
    secret: config.jwtSecret,
    userProperty: 'auth'
})
// we can now add requireSignin to any route
// that should be protected against unauthorized access.

// to only be able to delete their own user, and not everyone else's
const hasAuthorization = (req, res) => {
    const authorized = req.profile && req.auth && req.profile._id == req.auth._id
    // req.auth is from express-jwt in requireSignin
    // req.profile is from userByID function in user.controller.js
    if (!(authorized)) {
        return res.status('403').json({
            error: "User is not authorized"
        })
    }
    next() 
}

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization
}