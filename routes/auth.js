const router      = require('express').Router()
const User        = require('../models/User')
const passport    = require('passport')
const uploadCloud = require('../helpers/cloudinary')
const sendMail    = require('../helpers/nodemailer').sendMail

const Stock       = require("../models/Stock")
const Transaction = require("../models/Transaction")

//bcrypt
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

//Middleware para saber si tiene sesión iniciada
const isLogged = (req, res, next) => {
  if (req.isAuthenticated()) next()
  else res.redirect('/login')
}

//indice
router.get("/",(req,res,next)=>{
  res.render("index")
})


//REGISTRO
router.get('/signup', (req, res) => {
  configuration = {
    title: 'Registrarse',
    btnValue: 'Crear cuenta',
    url: '/signup',
    password: true,
    id: ''
  }
  res.render('auth/signup', configuration)
})

router.post('/signup', (req, res, next) => {
  const {username,email} = req.body
  const saltConf = bcrypt.genSaltSync(bcryptSalt);
  const confCode = bcrypt.hashSync(req.body.username, saltConf);
  User.register({username,email,confCode},req.body.password,)
  .then(user => {
    sendMail(req.body.email, confCode )
    res.redirect('/login')
  })
  .catch(e => {
    console.log(e)
    configuration = {
      title: 'Registrarse',
      btnValue: 'Crear cuenta',
      url: '/signup',
      password: true,
      id: '',
      errorMsg: e.message
    }
  res.render('auth/signup', configuration)    
  })
})

//confirm email
router.get('/confirm', (req,res,next)=>{
  const {code} = req.query

  User.findOneAndUpdate({confCode: code},{$set:{status: 'Active'}},{new:true},(err,user)=>{
    res.send("Correo confirmado!")
  })

})

//INICIO DE SESIÓN
router.get('/login', (req, res) => {
  if (req.user) req.logOut() //Si vas a login te desloguea primero
  res.render('auth/login')
})

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  req.app.locals.loggedUser = req.user;
  res.redirect('/profile')
})


//PERFIL
router.get('/profile', isLogged, (req, res) => {
  User.findById(req.app.locals.loggedUser._id)
  .then(usuario => {
    Transaction.find({user:usuario}).populate("stock")
    .then(transactions=>{
      res.render('profile/profile', {usuario,transactions}) 
    })
  })
  .catch(e => console.log(e))
})

router.get('/edit/:id', isLogged, (req, res) => {
  configuration = {
    title: 'Editar perfil',
    btnValue: 'Salvar cambios',
    url: '/edit',
    username: req.app.locals.loggedUser.username,
    email: req.app.locals.loggedUser.email,
    password: false,
    id: req.user._id
  }
  res.render('auth/signup', configuration)
})

router.post('/edit/:id', (req, res, next) => {
  let {id} = req.params
  User.findByIdAndUpdate(id, req.body, {new: true})
  .then(user => {
    req.app.locals.loggedUser = user
    res.redirect('/profile')
  })
  .catch(e => next(e))
})

router.get('/edit_image', isLogged, (req, res) => {
  res.render('profile/edit_image',{photo:req.app.locals.loggedUser.photoURL})
})

router.post('/edit_image', isLogged, uploadCloud.single('photoURL'), (req, res, next) => {
  User.findByIdAndUpdate(req.app.locals.loggedUser._id, { photoURL: req.file.url }, { new: true })
  .then(user => {
    req.app.locals.loggedUser = user
    res.redirect('/profile')
  })
  .catch(e => next(e))
})

router.get("/create_new_transaction_stock",(req,res,next)=>{
  const newUser = new User({
    username: 'johnny',
    email: 'johnny@gmail',
    password: 'asd1313f123a%$adsfafds1232131',
    confirmationCode: 'asd1313f123a%$adsfafds1232131',
    //status: 'Pending Confirmation'  >>>ommitted
    photoURL: 'www.cloudinary.com/img123',
    //cash: 200,000 >>>>ommitted

  });
  const newStock = new Stock({
    name: 'I like it - Cardi B',
    SpotifyID: '4S8d14HvHb70ImctNgVzQQ',
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
    user: "5baac1cd11b46c4b0f3e1653",
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

})

module.exports = router