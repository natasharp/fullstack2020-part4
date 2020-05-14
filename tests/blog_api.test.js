const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)
const bcrypt = require('bcrypt')

beforeEach(async () => {
    await Blog.deleteMany({})

    const noteObjects = helper.initialBlogs
        .map(blog => new Blog(blog))
    const promiseArray = noteObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
    const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})

describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
        const newBlog = {
            title: 'Be water my friend',
            author: 'Brane Games',
            url: 'https://branegames.com/blog/converting-shadertoy-shaders-to-godot/',
            likes: 10
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)


        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)

        const contents = blogsAtEnd.map(n => n.title)
        expect(contents).toContain(newBlog.title)
    })

    test('return value 0 for likes property when property is missing from the request ', async () => {
        const newBlog = {
            title: 'Be water my friend',
            author: 'Brane Games',
            url: 'https://branegames.com/blog/converting-shadertoy-shaders-to-godot/'
        }

        const retVal = await api
            .post('/api/blogs')
            .send(newBlog)

        expect(retVal.body.likes).toBe(0)
    })

    test('note without title and author is not added', async () => {
        const newBlog = new Blog({
            title: '',
            author: '',
            url: 'https://branegames.com/blog/converting-shadertoy-shaders-to-godot/',
            likes: 42
        }, { _id: false })

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const blogsAfterPosting = await helper.blogsInDb()
        expect(blogsAfterPosting).toHaveLength(helper.initialBlogs.length)
    })
})

describe('remove of the blog', () => {
    test('succeeds with valid id and returns status code 204', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAfterPosting = await helper.blogsInDb()
        expect(blogsAfterPosting).toHaveLength(helper.initialBlogs.length - 1)
    })
})

describe('update of the blog', () => {
    const blogToUpdate = {
        title: 'Converting Shadertoy Shaders To Godot ',
        author: 'Brane Games',
        url: 'https://branegames.com/blog/converting-shadertoy-shaders-to-godot/',
        likes: 122
    }

    test('succeeds with valid data', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blog = blogsAtStart[0]

        const updatedBlog = await api
            .put(`/api/blogs/${blog.id}`)
            .send(blogToUpdate)

        const blogsAfterPosting = await helper.blogsInDb()
        expect(blogsAfterPosting).toHaveLength(helper.initialBlogs.length)
        expect(updatedBlog.body.likes).toEqual(blogToUpdate.likes)
    })

    test('returns status code 400 with invalid id', async () => {
        await api
            .put(`/api/blogs/0`)
            .send(blogToUpdate)
            .expect(400)
    })
})

describe('adding new user', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const saltRounds = 10
        const passwordHash = await bcrypt.hash('123456789', saltRounds)
    
        const user = new User({
            username: 'bananica',
            name: 'Ana Banana',
            passwordHash: passwordHash,
        })

        await user.save()
    })

    test('succeeds with valid data and returns status code 201', async () => {
        const usersAtStart = await helper.usersInDb()
        
        const user = {
            username: "lubenica",
            name: "Jagoda Banana",
            password: "123456"
        }

        await api
            .post(`/api/users/`)
            .send(user)
            .expect(201)

        const usersAfterAdding = await helper.usersInDb()
        expect(usersAfterAdding).toHaveLength(usersAtStart.length + 1)

        expect(usersAfterAdding.map(u => u.username)).toContain(user.username)
    })

    test('returns status code 400 if password is missing)', async () => {
        const usersAtStart = await helper.usersInDb()

        const user = {
            username: 'jagodicabobica',
            name: 'Jagoda J.'
        }

        await api
            .post(`/api/users/`)
            .send(user)
            .expect(400)

        const usersAfterAdding = await helper.usersInDb()
        expect(usersAfterAdding).toHaveLength(usersAtStart.length)
    })

    test('returns status code 400 with invalid username', async () => {
        const usersAtStart = await helper.usersInDb()

        const user = {
            username: 'ba',
            name: 'Ana Banana',
            password: '123456'
        }

        await api
            .post(`/api/users/`)
            .send(user)
            .expect(400)

        const usersAfterAdding = await helper.usersInDb()
        expect(usersAfterAdding).toHaveLength(usersAtStart.length)
    })

    test('returns status code 400 with existing username', async () => {
        const usersAtStart = await helper.usersInDb()

        const user = {
            username: 'bananica',
            name: 'Ana Druga',
            password: '123456789'
        }

        await api
            .post(`/api/users/`)
            .send(user)
            .expect(400)

        const usersAfterAdding = await helper.usersInDb()
        expect(usersAfterAdding).toHaveLength(usersAtStart.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
})