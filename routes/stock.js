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


router.post('/:id',isLogged,  function(req, res, next){
  console.log('entered post')
  const {id} = req.params
  var dbStock;
  // price = calcPrice(SpotID) //from (../helpers/price.js)

  // hay un riesgo de que el precio cambie desde que el usuario carga la página hasta que envía el request. hay que pasar una variable en el post que sea el price paid y comparar con el calcPrice. Si cambió hay que devolver un error. el price paid no se puede usar directamente para también evitar manipulacion por parte del usuario.
  
  // if(price !== req.body.price )
  //   res.render('stock', {error: 'Price changed. Please try again'})

  //create stock if does not exist yet, and save to variable
  Stock.findOne({SpotifyID: id})
    .then((r)=>{
      if(r==null){
        console.log('didnt find song')
            spotifyApi.getTrack(id)
            .then((song)=>{
              Stock.create({
                name: song.body.name,
                SpotifyID: id,
                price: req.body.price //dangerous - should say just 'price'
                })
                .then((r)=>{dbStock=r; console.log(dbStock)})
                .catch((e)=>console.log(e))  
              })
            .catch((e)=>console.log(e))
        dbStock=r
        } else console.log("found an existing song: " + r)
      })
    .catch(
        (e)=>{console.log(e)}
    )


  
  //create a new transaction with this user and this stock
    Transaction.create({
      user: req.user.id,
      stock: dbStock._id,  
      pricePaid: req.body.price, //dangerous - should say just 'price', 
      quantity: req.body.quantity,//va a variar si es sell o buy route
      type: 'Buy'
    })
/*
  //debit money from the user's cash 
    User.findById(req.User._id).then((usr)=>
      User.findByIdAndUpdate(req.User._id,{cash:usr.cash-price*req.body.quantity})
    )
  //show the user a success message on the same page 
  //and a link to his/her portfolio
    res.render('stock',{success=true})
    */
})

module.exports = router