
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const stockSchema = new Schema({
  name: String,
  //symbol: String, <futureversion>
  SpotifyID: String,
  price: Number,
  type: {
    type: String,
    enum: ['Artist', 'Song', 'Album'],
    default: 'Song' 
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;