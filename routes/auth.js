const router      = require('express').Router()
const User        = require('../models/User')
const passport    = require('passport')
const uploadCloud = require('../helpers/cloudinary')
const sendMail    = require('../helpers/nodemailer').sendMail
const moment      = require("moment")

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
      var cashInv= {invertido:0}
      var graphArrays={
        tipoDeTrans: ["start"],
        dinero : [200000]
      }
      let cash = 200000 
      for (t of transactions){
        let time = moment(t.created_at).format("MMM D YYYY")
        t["time"] = time
        
        if(t.type == "Buy"){
          cash -=( t.pricePaid*t.quantity)
          cashInv.invertido +=( t.pricePaid*t.quantity)
          graphArrays.tipoDeTrans.push(t.type)
          graphArrays.dinero.push(cash)
        }else{
          cash +=( t.pricePaid*t.quantity)
          cashInv.invertido -=( t.pricePaid*t.quantity)
          graphArrays.tipoDeTrans.push(t.type)
          graphArrays.dinero.push(cash)
        }
      }
      console.log(graphArrays)
      res.render('profile/profile', {usuario,transactions,graphArrays, cashInv}) 
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


module.exports = router