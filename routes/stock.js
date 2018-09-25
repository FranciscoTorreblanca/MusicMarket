const router      = require('express').Router()
const Stock        = require('../models/Stock')
const User        = require('../models/User')
//require('../helpers/price.js')

router.get('/:id',(req,res,next)=>{
  const {id} = req.params
  let stock = {
    song: 'Money',
    artist: 'Pink Floyd',
    imageURL: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Money_1973.jpg/220px-Money_1973.jpg'
  }
  res.render('stock/stock', stock)
})

/*
router.post('/buy/:id', (req, res, next) => {

  const SpotID = req.params
  var dbStock;
  price = calcPrice(SpotID) //from (../helpers/price.js)

  //hay un riesgo de que el precio cambie desde que el usuario 
  //carga la página hasta que envía el request. 
  //hay que pasar una variable en el post que sea el price paid
  //y comparar con el calcPrice. Si cambió hay que devolver un error.
  //el price paid no se puede usar directamente para también evitar 
  //manipulacion por parte del usuario.
  
  if(price !== req.body.price )
    res.render('stock', {error: 'Price changed. Please try again'})

  //create stock if does not exist yet, and save to variable
  Stock.findOne({SpotifyID: SpotID})
  .then((res)=>dbStock=res)
  .catch(
      ()=>{
          var song = spotifyApi.getTracks(SpotID)
          Stock.create({
              name: song.name,
              SpotifyID: SpotID,
              price: price 
          }).then((res)=>{dbStock=res})
      }
  )

  //create a new transaction with this user and this stock
    Transaction.create({
      user: req.User._id,
      stock: dbStock._id,  
      pricePaid: price, 
      quantity: req.body.quantity,//va a variar si es sell o buy route
      type: 'Buy'
    })

  //debit money from the user's cash 
    User.findById(req.User._id).then((usr)=>
      User.findByIdAndUpdate(req.User._id,{cash:usr.cash-price*req.body.quantity})
    )
  //show the user a success message on the same page 
  //and a link to his/her portfolio
    res.render('stock',{success=true})

})*/

module.exports = router