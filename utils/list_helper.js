const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((value, blog) => value + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.length === 0
    ? {}
    : blogs.find(blog => blog.likes === Math.max(...(blogs.map(blog => blog.likes))))
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {}
  } else {
    const authors = _.countBy(blogs, 'author')
    const authorWithMostBlogs = _.max(Object.keys(authors), author => authors[author])
    const numberOfBlogs = authors[authorWithMostBlogs]
    const retVal = {
      author: authorWithMostBlogs,
      blogs: numberOfBlogs
    }
    return retVal
  }
}

const mostLikes = (blogs) => {
  const authorWithMostLikes = _.maxBy(blogs, 'likes')
  return blogs.length === 0
    ? {}
    : {
      author: authorWithMostLikes.author,
      likes: authorWithMostLikes.likes
    }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}