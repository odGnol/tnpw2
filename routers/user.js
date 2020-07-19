const express = require ('express')
const User = require ('../models/user')
const auth = require ('../middleware/auth')
const Article = require ('./article')

const router = new express.Router()

//vytvoření uživatele, operace Create - požadavek Post
router.post('/users/new', async (req, res) => {
  const user = new User(req.body)
  
  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

//operace Create, požadavek Post - login
// použití autentizačního tokenu v obsluze přihlášení uživatele

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)

    const token = await user.generateAuthToken()
    
    res.send({ user, token })
  } catch (e) {
    res.status(400).send()
  }
})

//logout
router.post('/users/logout', auth, async(req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      // console.log('Porovnávám token.token ('+token.token+') s req.token ('+req.token+')')
      return token.token !== req.token
      
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

//logout all
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})


// čtení uzivatelů, operace Read-all, požadavek Get
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (e)  {
    res.status(500).send()
  }
})

//čtení uzivatele, operace Read-one, požadavek Get
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

// aktualizace zdrojů, operace Update, pořadavek Patch
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email']
  const isValidOperation = updates.every((update) =>
  allowedUpdates.includes(update))

  if(!isValidOperation) {
    return res.status(400).send({ error: 'Neplatné aktualizace!'})
  }

   try {
     updates.forEach((update) => req.user[update] = req.body[update])
      await req.user.save()
        res.send(req.user)
   } catch (e) {
     res.status(400).send(e)
   }
})

// operace Delete, požadavek Delete (přes auth, nikoliv :id)
router.delete('/users/me', auth, async(req, res) => {
  try {
  const user = await User.findByIdAndDelete(req.user._id)
  await req.user.remove()
  res.send(req.user)
  res.status(200).send()   
} catch (e) {
  res.status(500).send()
}
})



module.exports = router