const mongoose = require ('mongoose')

const articleSchema = new mongoose.Schema ({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  topic: {
    type: String,
    required: true,
    },
  form: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
  
})

const Article = mongoose.model('Article', articleSchema)

module.exports = Article