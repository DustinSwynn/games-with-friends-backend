const { kMaxLength } = require('buffer');
const express = require('express');
const path = require('path');
const url = require('url');
const codenames_server = require('../codenames/codenames_server.js');
const router = express.Router();


router.get("/*", (req, res, next) => {

  var cleanPath = url.parse(req.url).pathname;

  var filePath = '';

  switch(cleanPath) {

    case '/':

      filePath = path.resolve(__dirname, "../codenames/input.html");
      res.sendFile(filePath);
      break;

    case '/update':
      
      if( Object.keys(req.query).length > 0 ) {
        codenames_server.runGame(req.query);
      }

      res.send(codenames_server.getGameJSON());
      break;

    default:

      filePath = path.resolve(__dirname, '../codenames' + req.url);
      res.sendFile(filePath);
  }

});

module.exports = router;
