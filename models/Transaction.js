const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const trSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  stock: {
    type: Schema.Types.ObjectId,
    ref: 'Stock'
  },
  pricePaid: Number,
  quantity:Number,
  type: {
    type: String,
    enum: ['Buy', 'Sell'],
    default: 'Buy' 
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Transaction = mongoose.model('Transaction', trSchema);
module.exports = Transaction;