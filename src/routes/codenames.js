const { kMaxLength } = require('buffer');
const { query } = require('express');
const express = require('express');
const path = require('path');
const url = require('url');
const admin = require('firebase-admin');
const codenames_server = require('../codenames/codenames_server.js');
const router = express.Router();

router.get("/*", (req, res, next) => {

  var cleanPath = url.parse(req.url).pathname;

  var filePath = '';

  if( cleanPath == '/' ) {

    filePath = path.resolve(__dirname, "../codenames/input.html");
    res.sendFile(filePath);

  }else {

    filePath = path.resolve(__dirname, '../codenames' + req.url);
    res.sendFile(filePath);

  }

});

router.post("/*", (req, res, next) => {

  var cleanPath = url.parse(req.url).pathname;

  // Need to pull off the gameId
  let splitPath = cleanPath.split('/');  // note splitPath[0]' is '' due to the leading '/'

  let gameId = splitPath.length > 2 ? splitPath[2] : null;

  if( req.body.action == 'update' ) {

    res.send(codenames_server.getGameUpdate(gameId, req.body));

  } else {

    var retId = codenames_server.runGame(gameId, req.body);
    // Starting the first game in the session results in a gameId the client doesn't know about
    res.send(codenames_server.getGameUpdate(retId, req.body));

  }

});

module.exports = router;
