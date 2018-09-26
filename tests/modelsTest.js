const express = require('express');
const router  = express.Router();
const User = require("../models/User");
const Stock = require("../models/Stock");
const Transaction = require("../models/Transaction");


/* GET home page */
router.get('/', (req, res, next) => {

  const newUser = new User({
    username: 'johnny',
    email: 'johnny@gmail',
    password: 'asd1313f123a%$adsfafds1232131',
    confirmationCode: 'asd1313f123a%$adsfafds1232131',
    //status: 'Pending Confirmation'  >>>ommitted
    photoURL: 'www.cloudinary.com/img123',
    //cash: 200,000 >>>>ommitted

  });

  newUser.save()
  .then(()=>{
    console.log('Success')
  })
  .catch((error)=>{
    res.send(error)
  })

  const newStock = new Stock({
    name: 'I like it - Cardi B',
    SpotifyID: '1234334555',
    price: 25.74

  });

  newStock.save()
  .then(()=>{
    console.log('Success')
  })
  .catch((error)=>{
    res.send(error)
  })

  const newTr = new Transaction({
    user: newUser._id,
    stock: newStock._id,
    pricePaid: newStock.price,
    quantity: 100,
    type: 'Buy'
  })

  newTr.save()
  .then(()=>{
    console.log('Success')
  })
  .catch((error)=>{
    res.send(error)
  })

  Transaction.find().populate('user').populate('stock').then(result => res.send(result) )



});

module.exports = router;
