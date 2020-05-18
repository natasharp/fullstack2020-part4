const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('when list have only one blog equals of that', () =>
    expect(listHelper.totalLikes(helper.oneBlogInList)).toBe(7)
  )

  test('of a bigger list is calculated rigth', () =>
    expect(listHelper.totalLikes(helper.initialBlogs)).toBe(36)
  )
})

describe('favorite blog', () => {
  test('of empty list is empty object', () => {
    expect(listHelper
      .favoriteBlog([]))
      .toEqual({})
  })

  test('when list have only one blog equals of that', () =>
    expect(listHelper
      .favoriteBlog(helper.oneBlogInList))
      .toEqual(helper.oneBlogInList[0])
  )

  test('of a bigger list is calculated rigth', () =>
    expect(listHelper
      .favoriteBlog(helper.initialBlogs))
      .toEqual({
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      user: '5a422a851b54a676234d1755',
      __v: 0
    })
  )
})

describe('most blogs', () => {
  test('of empty list is empty object', () =>
    expect(listHelper
      .mostBlogs([]))
      .toEqual({})
  )

  test('when list have only one blog equals of that blog author', () =>
    expect(listHelper
      .mostBlogs(helper.oneBlogInList))
      .toEqual({ author: helper.oneBlogInList[0].author, blogs: 1 })
  )

  test('of a bigger list is calculated rigth', () =>
    expect(listHelper
      .mostBlogs(helper.initialBlogs))
      .toEqual({ author: 'Robert C. Martin', blogs: 3 })
  )
})

describe('most likes', () => {
  test('of empty list is empty object', () =>
    expect(listHelper
      .mostLikes([]))
      .toEqual({})
  )

  test('when list have only one blog equals of that blog author', () => {
    expect(listHelper
      .mostLikes(helper.oneBlogInList))
      .toEqual({ author: helper.oneBlogInList[0].author, likes: helper.oneBlogInList[0].likes })
  })

  test('of a bigger list is calculated rigth', () =>
    expect(listHelper
      .mostLikes(helper.initialBlogs))
      .toEqual({ author: 'Edsger W. Dijkstra', likes: 12 })
  )
})