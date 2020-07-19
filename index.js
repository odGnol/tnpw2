const express = require('express')
require('./db/mongoose')
const hbs = require ('hbs')
const path = require ('path')
const bcrypt = require('bcryptjs') 

const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
hbs.registerPartials(partialsPath)

const app = express()

app.set('view engine', 'hbs')
app.set('views', viewsPath)

const articleRouter = require('./routers/article')
const userRouter = require('./routers/user')

const port = process.env.PORT || 3000

//

app.use(express.json())
app.use(userRouter)
app.use(articleRouter)

app.listen(port, ()=> {
  console.log('Server poslouchá na portu ' + port)
})


// zkouška fungování midlleware Express
//Zakomentujte vždy jeden řádek, spusťte aplikaci a v nástroji Postman odešlete požadavek čtení všech uživatelů. Pozorujte rozdíl v chování.

app.use ((req, res, next) => {
  console.log('Porucha')
  res.status(503).send('Stránky jsou dočasně mimo provoz. Vraťte se brzy!')
  next()
})






