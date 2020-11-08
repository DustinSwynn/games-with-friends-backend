const express = require('express');
const path = require('path');  
const codenames = require('../codenames/codenames.js');
const router = express.Router();

router.post("/", (req, res, next) => {
  console.log("Request", req.body);
  res.send("hello!");
});

router.get("/input.html", (req, res, next) => {

  console.log("Received the following items with the GET request:", req.query);

  if( Object.keys(req.query).length > 0 ) {
    
    codenames.runGame(req.query);

  }

  // Send the file back
  let filePath = path.resolve(__dirname, '../codenames/input.html');
  res.sendFile(filePath);
})

module.exports = router;