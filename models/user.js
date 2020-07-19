const mongoose = require ('mongoose')
const validator = require ('validator')
const bcrypt = require('bcryptjs')
const jwt = require ('jsonwebtoken')
const Article = require('./article')

const userSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Neplatná mailová adresa!')
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if(value.toLowerCase().includes('heslo')) {
        throw new Error('Heslo nesmí obsahovat "heslo"')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
})

// funkce, která se bude konat před uložením uživatele do databáze, funkce rovněž zkontroluje, jestli se heslo změnilo

userSchema.pre('save', async function(next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

/////// metoda objektu user pro generování autentizačních tokenů
// valentýn je na místě pro tajný výraz (lze použít jakýkoliv jiný výraz)

userSchema.methods.generateAuthToken = async function() {
  const user = this
  const token = jwt.sign( { _id: user._id.toString()}, 'Cecílie')

  user.tokens = user.tokens.concat( { token } )
  await user.save()

  return token
}

// //// ukrytí soukromých dat
userSchema.method.toJSON = function() {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  return userObject
}

// ///

// /////// Přihlášení uživatelů
// // 1. zadání emailu a hesla, 2. nejdříve nalezení uživatele dle emailu, 3. potom bcrypt pro ověření hesla
// // jakékoli selhání vede k tomu, že se uživatel nemůže přihlásit

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email})
  if (!user) {
    throw new Error ('Přihlášeni selhalo - uživatel nenalezen')
  }
    const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error ('Uživatel nepřihlášen - údaje neodpovídají')
  }
  return user
}




// //////////
// //virtuální vlastnost uživatele, odkaz na data úloh, která jsou uložena v oddělené kolekci
userSchema.virtual('articles', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'owner'
})

// /////////

// zřetězené odstranění úloh
userSchema.pre('remove', async function (next) {
  const user = this
  await Article.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User