const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const api = supertest(app)

beforeEach(async () => {
    await Note.deleteMany({})
  
    const noteObjects = helper.initialNotes
      .map(note => new Note(note))
    const promiseArray = noteObjects.map(note => note.save())
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
        const newBlog = {
            url: 'https://branegames.com/blog/converting-shadertoy-shaders-to-godot/',
            likes: 42
        }

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
        console.log(updatedBlog.body)
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

afterAll(() => {
    mongoose.connection.close()
})