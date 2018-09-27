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
    var stock;
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
            url: id,
            error:req.query.error,
            message:req.query.message
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

  if(req.body.quantity <= 0){
    error = encodeURIComponent('Please enter a valid quantity, greater than zero')
    res.redirect(`/stock/${id}/?error=${error}`)
    //res.render('stock/stock', {error: 'Please enter a valid quantity, greater than zero'})
    return;
  }

  try {
    var price = await Pricing.calcPrice(id)
  }catch(err){console.log(err); return;}


  // hay un riesgo de que el precio cambie desde que el usuario carga la página hasta que envía el request. Hay que pasar una variable en el post llamada price  y calcular si es igual al precio actual. Esto previene manipulación del usuario y también protege contra cambios en el precio.
  console.log('Current price:' + price)
  console.log('Price submitted:' + req.body.price)
  if(price != req.body.price ){
    error = encodeURIComponent('Price changed. Please try again')
    res.redirect(`/stock/${id}/?error=${error}`)
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
    //Check that user owns the stock that he wants to sell
    if(req.body.type == 'Sell'){
      console.log('Sell transaction')
        var trs = await Transaction.find({$and: [{user: req.user._id}, {stock: dbStock._id}]})
        console.log(trs)
        if(trs==null){
          error = encodeURIComponent('You dont own this stock. Do you wish to buy it instead?.')
          res.redirect(`/stock/${id}/?error=${error}`)
          return;
        }else {
          var sharesOwned=0;
          for (tr of trs){
            if(tr.type == 'Buy')
             sharesOwned += tr.quantity;
            else 
             sharesOwned -= tr.quantity;
          }
          if(sharesOwned<req.body.quantity){
            error = encodeURIComponent('You dont own enough shares of this stock. Please change your quantity to Sell and try again.')
            res.redirect(`/stock/${id}/?error=${error}`)
            return; 
          }
        }
    }

    //Check that user has enough money to buy
    if(req.body.type == 'Buy') {
      if(!((req.app.locals.loggedUser.cash-price*req.body.quantity)>0)) {
        error = encodeURIComponent('Not enough cash in account. Please try selling some stock or change amount')
        res.redirect(`/stock/${id}/?error=${error}`)
        return;
      }
  }

  //create a new transaction with this user and this stock
  try{
    var newTr = await Transaction.create({
      user: req.user._id,
      stock: dbStock._id,
      pricePaid: price,  
      quantity: req.body.quantity,//va a variar si es sell o buy route
      type: req.body.type
    })
  }catch(err){console.log(err); return}
  console.log('New Transaction created' + newTr)


  //if buy transaction, then debit money from the user's cash 
    if(newTr.type == 'Buy') {
      User.findById(newTr.user)
      .then((usr)=>{
        if(usr!=null)
         User.findByIdAndUpdate(usr,{cash:usr.cash-newTr.pricePaid*newTr.quantity})
         .then(()=>req.app.locals.loggedUser = usr)
         .catch((err)=>{console.log(err);return})
      }).catch((err)=>{console.log(err);return})
    }
  //if sell credit money to the user's cash
  if(newTr.type == 'Sell') {
   
    //credit money to the users acct
    User.findById(newTr.user)
    .then((usr)=>{
      if(usr!=null)
       User.findByIdAndUpdate(usr,{cash:usr.cash+newTr.pricePaid*newTr.quantity})
       .then(()=>req.app.locals.loggedUser = usr)
       .catch((err)=>{console.log(err);return})
    }).catch((err)=>{console.log(err);return})
  }
  //show the user a success message on the same page and a link to his/her portfolio
  message = encodeURIComponent('Success! Your transaction was confirmed')
  res.redirect(`/stock/${id}/?message=${message}`)
  
})

module.exports = router