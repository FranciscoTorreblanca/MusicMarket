const passport = require('passport')
const User     = require('../models/User')
//falta modelo de usuario

passport.use(User.createStrategy())

passport.serializeUser((user, cb) => {
  cb(null, user)
})

passport.deserializeUser((user, cb) => {
  cb(null, user)
})

module.exports = passport