const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs')
    response.status(201).json(users)
})

usersRouter.post('/', async (request, response) => {
    const body = request.body

    if (!body.password || (body.password.length) < 3) {
        return response.status(400).json({ error: 'password missing or short' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const newUser = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await newUser.save()
    response.status(201).json(savedUser.toJSON())
})

module.exports = usersRouter


