// import the mongoose module
// use it to generate a UserSchema, containing schema def and user-related business logic 
// to make up the user model.
// this user model will be exported so that it can be used with the rest of the backend code
import mongoose from 'mongoose';
import crypto from 'crypto'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
    
    email: {
        type: String,
        trim: true,
        unique: 'Email already exists',
        match: [/.+\@.+\..+/, 'Please fill in a valid email address'],
        required: 'Email is required'
    },
    updated: Date,
    salt: String,
    created: {
        type: Date,
        default: Date.now
    },
    
    // password is not stored directly in the db and will be handled separately
    hashed_password: {
        type: String,
        required: 'Password is required'
    }, 
})
// UserSchema takes a schema definition object that will specify the prop or structure of each document in a collection.

// handling the pw in a virtual field
UserSchema
.virtual('password')
.set(function(password) {
    this._password = password
    this.salt = this.makeSalt() // unique salt value, to prevent conflict when two or more users share the same pw.
    // adding salt will also make it harder to guess which hashing algo was used since same input can produce different hash results.
    this.hashed_password = this.encryptPassword(password) // encrypted and stored into a new hashed value
})
.get(function() {
    return this._password
})

// add more complicated password requirements such as 
// 1 capital, 1 number, 1 special char
UserSchema.path('hashed_password').validate(function(v) {
    if (this._password && this._password.length < 8) {
        this.invalidate('password', 'Password must be at least 8 characters.')
    }
    if (this.isNew && !this._password) {
        this.invalidate('password', 'Password is required')
    }
}, null)

// the encryption logic and salt generation logic to generate hashed password and salt values
UserSchema.methods = {
    // method is called to verify sign-in attempts by matching
    // user provided pw text w hashed_password stored in db for user
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password
    },
    // generate an encypted hash from plain-text pw and a unique salt value 
    // using crypto module in Node.
    encryptPassword: function(password) {
        if (!password) return ''
        try {
            return crypto
                .createHmac('sha1', this.salt) // hashing algo generate same hash for same input value.
                .update(password)
                .digest('hex')
        } catch (err) {
            return ''
        }
    },
    // Method generates a unique and random salt value using current
    // timestamp at execution and Math.random()
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + ''
    }
}

export default mongoose.model('User', UserSchema)

