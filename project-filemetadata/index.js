const express = require('express')
const multer  = require('multer')
const cors = require('cors');
require('dotenv').config()

const app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    cb(null, true)
  }
})

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      })
    }
    const fileAnalysis = {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    }
    res.json(fileAnalysis)
  } catch (err) {
    res.status(500).json({
      error: 'Metadata analysis failed',
      message: err.message
    })
  }
})

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
