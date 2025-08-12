const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3000
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const formatDate = (date) => new Date(date).toDateString()

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
})

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)

app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body
    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }
    const newUser = new User({ username })
    await newUser.save()
    res.json({
      username: newUser.username,
      _id: newUser._id
    })
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Username already exists' })
    } else {
      res.status(500).json({ error: 'Server error' })
    }
  }
  
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params
    const { description, duration: durationStr, date: dateStr } = req.body
    if (!description || !durationStr) {
      return res.status(400).json({ error: 'Description and duration are required' })
    }
    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    duration = parseInt(durationStr)
    if (isNaN(duration)) {
      return res.status(400).json({ error: 'Duration must be a number' })
    }
    date = dateStr ? new Date(dateStr) : new Date()
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }
    const exercise = new Exercise({
      userId: user._id,
      username: user.username,
      description,
      duration,
      date
    })
    await exercise.save()
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: formatDate(exercise.date),
      _id: user._id
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('username _id')
    const response = users.map(user => ({
      _id: user._id,
      username: user.username
    }))
    res.json(response)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params
    const { from, to, limit } = req.query
    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })      
    }
    let dateFilter = {}
    if (from) {
      const fromDate = new Date(from)
      if (!isNaN(fromDate.getTime())) {
        dateFilter.$gte = fromDate
      }
    }
    if (to) {
      const toDate = new Date(to)
      if (!isNaN(toDate.getTime())) {
        dateFilter.$lte = toDate
      }
    }
    let query = { userId: user._id }
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter
    }
    let exerciseQuery = Exercise.find(query).select('description duration date -_id').sort({ date: 'asc'})
    if (limit) {
      const limitNum = parseInt(limit)
      if (!isNaN(limitNum)) {
        exerciseQuery = exerciseQuery.limit(limitNum)
      }
    }
    const exercises = await exerciseQuery.exec()
    const log = exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }))
    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log
    })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
