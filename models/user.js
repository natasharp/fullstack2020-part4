const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    password: String
})

userSchema.set('toJSON', {
    transform: (document, rereturnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
            delete returnedObject._id,
            delete returnedObject.__v,
            delete returnedObject.passwordHash
    }
})

module.exports = mongoose.model('User', userSchema)

