const mongoose = require('mongoose')
const Schema   = mongoose.Schema
const PLM      = require('passport-local-mongoose')

const userSchema = new Schema({
  username: String,
  email: String,
  photoURL: {
    type: String,
    default: "https://res.cloudinary.com/torreblanca/image/upload/v1537906945/prodigy/deafult.jpg"
  },
  confCode: String,
  cash: {
    type: Number,
    default:200000
  },
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
