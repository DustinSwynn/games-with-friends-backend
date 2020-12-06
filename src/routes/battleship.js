const { kMaxLength } = require('buffer');
const express = require('express');
const path = require('path');
const url = require('url');
const myutils = require('../utils/utils');
const router = express.Router();
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'second-folio-294223',
  keyFilename: path.join(__dirname, '../../games-with-friends-service-account-key.json')
});


router.get("/*", (req, res, next) => {

  var cleanPath = url.parse(req.url).pathname;

  var filePath = '';

  switch(cleanPath) {

    case '/':

      filePath = path.resolve(__dirname, "../battleship/index.html");
      res.sendFile(filePath);
      break;

    case '/addWin':

      myutils.addGame(req.query.userid, "Battleship", true);
      break;

    case '/addLoss':

      myutils.addGame(req.query.userid, "Battleship", false);
      break;

    default:

      filePath = path.resolve(__dirname, '../battleship' + cleanPath);

      res.sendFile(filePath);
  }

});

// router.post("/user", (req, res, next ) => {
//   let userId = req.body.userId;

//   var userRef = db.collection('users').doc(userId);

//   userRef.update({
//     record: Firestore.FieldValue.arrayUnion({"game":"Battleship", "when":Date(), "win":})
//   });

// })

module.exports = router;
