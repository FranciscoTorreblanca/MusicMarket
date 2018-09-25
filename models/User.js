const mongoose = require('mongoose')
const Schema   = mongoose.Schema
const PLM      = require('passport-local-mongoose')

const userSchema = new Schema({
  username: String,
  email: String,
  photoURL: String,
  confCode: String,
  cash: Number,
  status: {
    type: String,
    enum:["Pending","Active"],
    default: "Pending"
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }, 
  versionKey: false //Opcional
})

module.exports = mongoose.model('User', userSchema.plugin(PLM, {usernameField: 'email'}))
