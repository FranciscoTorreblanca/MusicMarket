require('dotenv').config()
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user:process.env.EMAIL,
    pass: process.env.PW
  }
})

exports.sendMail=(email, code)=>{
  transporter.sendMail({
    from: 'Prodigy',
    to:email,
    subject: 'Confirma tu email',
    text: '¡Bienvenido! Haz click en el link para confirmar tu correo  ',
    html:`<p> Verfica tu email dando click <a href="http://localhost:3000/confirm?code=${code}">aqui</a></p>
          <p>Si el enlace de arriba no funciona, copie y pegue el siguiente enlace en su navegador: http://localhost:3000/confirm?code=${code} </p>`
  })
  .then(info=>console.log(info))
  .catch(e=>console.log("Error al enviar emails",e))
}