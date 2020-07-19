const express = require ('express')
const Article = require ('../models/article')
const auth = require ('../middleware/auth')

const router = new express.Router()

//úvodní stránka
router.post('/index', async (req, res) => {
    res.render('index.hbs')

})

//nový příspěvek, operace Create - požadavek Post
router.post('/articles/new', auth, async (req, res) => {
  const article = new Article({
  ...req.body,
  owner: req.user._id
})

  try {
    await article.save()
    res.status(201).send(article)
} catch (e) {
  
    res.status(400).send(e)
  }
})

// seznam příspěvků, operace read-all, požadavek Get
router.get('/articles', auth, async (req, res) => {
  
  try {
    const articles = await Article.find({})
    res.send(articles)
    // res.render('articles.hbs')

  } catch (e) {
    res.status(500).send()
  }
})

//výběr jednoho příspěvku, read one
router.get('/articles/:id', auth, async (req, res) => {
  const _id = req.params.id
try {
  const article = await Article.findOne({
    _id, owner: req.user._id
  })
    if (!article) {
      return res.status(404).send()
    }

    res.send(article)
  } catch(e) {
    res.status(500).send()
  }
})

// aktualizace zdrojů, operace Update, pořadavek Patch
// aktualizace povolených polí
router.patch('/articles/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['title', 'description', 'topic',, 'form', 'createdAt', 'owner']
  const isValidOperation = updates.every((update) =>
  allowedUpdates.includes(update))

  if(!isValidOperation) {
    return res.status(400).send({ error: 'Neplatné aktualizace!'})
  }

   try {
       const article = await Article.findOne({
         _id: req.params.id, owner: req.user._id      })
    if(!article) {
      return res.status(404).send() // selhání, např. hodnoty neprošly validací u modelu
    }
      updates.forEach((update) => article[update] = req.body[update])
      await article.save()
      res.send(article)
   } catch (e) {
     res.status(400).send(e)
   }
})

// operace Delete, požadavek Delete
router.delete('/articles/:id', auth, async(req, res) => {
  try {
    const article = await Article.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
  if(!article) {
    return res.status(404).send()
  }
  res.status(200).send()
} catch (e) {
  res.status(500).send()
}
})

module.exports = router