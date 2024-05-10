
const express = require('express')
const app = express()

console.log("pingin server is running to versel")


app.use('/', express.static(path.join(__dirname, 'data'))) 

app.listen(3000,(error)=>{
    console.log(error ? error:"RUN SERVER localhost:3000")
})



// Export the Express API
module.exports = app;
