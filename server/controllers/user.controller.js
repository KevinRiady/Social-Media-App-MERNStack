// Defining the controller methods used in user.routes.js

import User from '../models/user.model'
import extend from 'lodash/extend' //yarn add lodash
import errorHandler from './../helpers/dbErrorHandler'

const create = async (req, res, next) => {
    const user = new User(req.body)
    try {
        await user.save() // // await within async allows us to wait with user.save(), which returns a promise
        return res.status(200).json({
            message: "Successfully signed up!"
        })
    }
    catch (err) { // if promise rejects, then this code will run
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

const list = async (req, res) => {
    try {
        // the result by not including salt and hashed is that
        // when we make a GET request for a list of users,
        // salt and hash do not appear in the result of the request.
        let users = await User.find().select('name email updated created') // populates these fiels in the resulting user list from the db.
        res.json(users)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

const userByID = async (req, res, next, id) => {
    try {
        let user = await User.findById(id)
        if (!user)
        return res.status('400').json({
            error: "User not found"
        })
        req.profile = user
        next()
    } catch(err) {
        return res.status('400').json({
            error: "Could not retrieve user"
        })
    }
}
const read = (req, res) => {
    // retrieves user info but removes sensitive information
    req.profile.hashed_password = undefined
    req.profile.salt = undefined
    return res.json(req.profile)
}

const update = async (req, res, next) => {
    try {
        let user = req.profile
        user = extend(user, req.body)
        user.updated = Date.now()
        await user.save()
        user.hashed_password = undefined
        user.salt = undefined
        res.json(user)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}
const remove = async (req, res, next) => {
    try {
        let user = req.profile
        let deletedUser = await user.remove()
        deletedUser.hashed_password = undefined
        deletedUser.salt = undefined
        res.json(deletedUser)
    }
    catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

export default { create, userByID, read, list, remove, update }

