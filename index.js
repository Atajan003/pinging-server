require('dotenv').config()
const express = require('express')
const fs = require('fs');
const path = require('path');
const app = express()
const bodyParser = require('body-parser')
const sheets = require('./sheets')
const jwt = require('jsonwebtoken')

const jsonFilesDirectory = path.join(__dirname, 'data');

// parse application/json
app.use(bodyParser.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.send('Welcome to our pinging server!')
})

app.post('/api/login', async (req, res) => {
  try {
    const { code, device_id } = req.body
    if (!code || !device_id) {
      return res.status(400).json({
        status: false,
        msg: 'Please enter your code and device identifier'
      })
    }

    const googleSheetClient = await sheets.GetGoogleSheetClient()

    const { row, index } = await sheets.GetRowsByCode(googleSheetClient, code)

    if (index === -1) {
      return res.status(400).json({
        status: false,
        msg: 'your code not correct'
      })
    }

    if (row[0] != '') {
      return res.status(403).json({
        status: false,
        msg: 'code is alrady used '
      })
    }

    let expiresIn = sheets.CalculateExpiresIn(row[2])

    if (expiresIn === 0) {
      return res.status(401).json({
        status: false,
        msg: 'code is expired'
      })
    }

    row[0] = device_id
    const data = await sheets.UpdateRowByCode(googleSheetClient, index, row)

    if (data.status !== 200) {
      return res.status(500).json({
        status: false,
        msg: 'server cant update device'
      })
    }

    token = jwt.sign({ device_id: device_id, code: code }, 'normalnybol', { expiresIn: expiresIn })
    return res.json({
      status: true,
      msg: 'You are logged in',
      token: token
    })
  } catch (e) {
    console.log(e)
    res.status(500).send(e.message)
  }
})

app.get('/api/:file', (req, res) => {
    const fileName = req.params['file'];

    // Check if file name is provided
    if (!fileName) {
        return res.status(400).json({ error: 'No file name provided' });
    }

    const filePath = path.join(jsonFilesDirectory, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Read the contents of the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading file' });
        }
        res.json({ data });
    });
});

app.listen(3000,(error)=>{
    console.log(error ? error:"RUN SERVER localhost:3000")
})



// Export the Express API
module.exports = app;
