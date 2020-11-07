const express = require('express');
const path = require('path');
const codenames_server = require('../codenames/codenames_server.js');
const router = express.Router();

router.post("/", (req, res, next) => {
  console.log("Request", req.body);
  res.send("hello!");
});

router.get("/update", (req, res, next) => {

  if( Object.keys(req.query).length > 0 ) {
    
    codenames_server.runGame(req.query);

  }

  res.send(codenames_server.getGameJSON());

});

// Main page to play game. Also expecting input from here
router.get("/input.html", (req, res, next) => {

  let filePath = path.resolve(__dirname, '../codenames/input.html');
  res.sendFile(filePath);

});

// CSS page for main page
router.get("/input_styles.css", (req, res, next) => {

  let filePath = path.resolve(__dirname, '../codenames/input_styles.css');
  res.sendFile(filePath);

});

// JS scripts for main page
router.get("/input_scripts.js", (req, res, next) => {

  let filePath = path.resolve(__dirname, "../codenames/input_scripts.js");
  res.sendFile(filePath);

});

module.exports = router;
