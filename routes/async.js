const router      = require('express').Router()
const Stock        = require('../models/Stock')
const User        = require('../models/User')
const Transaction        = require('../models/Transaction')
const spotifyApi = require('../helpers/spotify')
const Pricing = require('../helpers/price.js')

const isLogged = (req, res, next) => {
  if (req.isAuthenticated()) next()
  else res.redirect('/login')
}

router.get('/:id',(req,res,next)=>{
    const {id} = req.params
    var stock
    Pricing.calcPrice(id)
      .then((pr)=>{
        console.log("promise resolved" + pr)
        spotifyApi.getTrack(id)
        .then((r)=> {
    
          stock = {
            song: r.body.name,
            artist: r.body.artists[0].name,
            imageURL: r.body.album.images[1].url,
            price: pr,
            url: id
          }
          console.log(stock.price)
          res.render('stock/stock', stock)
        })
        .catch((r)=>console.log(r))})
      .catch(()=>console.log('Promise failed'))

})





router.post('/:id', isLogged, async function (req, res, next) {
  console.log('entered post')
  const { id } = req.params
  var dbStock; 

  try {
    var price = await Pricing.calcPrice(id)
  }catch(err){console.log(err); return;}

  //TODO: Check that user has enough money to buy
  //TODO: Check that user owns the stock that he wants to sell

  // hay un riesgo de que el precio cambie desde que el usuario carga la página hasta que envía el request. Hay que pasar una variable en el post llamada price  y calcular si es igual al precio actual. Esto previene manipulación del usuario y también protege contra cambios en el precio.
  console.log('Current price:' + price)
  console.log('Price submitted:' + req.body.price)
  if(price != req.body.price ){
    res.render('stock/stock', {error: 'Price changed. Please try again'})
    return;
  }
  //create stock if does not exist yet, and save to variable
  
  try {
    dbStock = await Stock.findOne({ SpotifyID: id })
  }
  catch (err) {
    console.log(err)
    return;
  }

  if (dbStock == null) {
    console.log('Did not find song in database')
    try {
      var song = await spotifyApi.getTrack(id)
    } catch (err) {
      console.log(err)
      return;
    }

    try {
      var stockCreated = await Stock.create({
        name: song.body.name,
        SpotifyID: id,
        price: price
      })
    } catch (err) {
      console.log(err)
      return;
    }
    console.log('New Stock created' + stockCreated)
    dbStock = stockCreated
  }
  else {
    console.log("Found an existing song: " + dbStock)
  }

  //create a new transaction with this user and this stock
  try{
    var newTr = await Transaction.create({
      user: req.user.id,
      stock: dbStock._id,
      pricePaid: price,  
      quantity: req.body.quantity,//va a variar si es sell o buy route
      type: req.body.type
    })
  }catch(err){console.log(err); return}
  console.log('New Transaction created' + newTr)

  /*

  //if buy debit money from the user's cash 
      User.findById(req.User._id).then((usr)=>
        User.findByIdAndUpdate(req.User._id,{cash:usr.cash-price*req.body.quantity})
      )
  //if sell creadit money to the user's cash
  //show the user a success message on the same page and a link to his/her portfolio
*/
     res.render('stock/stock', {message: 'Success! Your transaction was confirmed'})

})

module.exports = router