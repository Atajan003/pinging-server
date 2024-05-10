
const express = require('express')
const fs = require('fs');
const path = require('path');
const app = express()

console.log("pingin server is running to versel")

const jsonFilesDirectory = path.join(__dirname, 'data');

app.get('/:file', (req, res) => {
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
