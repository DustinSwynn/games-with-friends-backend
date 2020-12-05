const express = require('express');
const path = require('path');  
const codenames = require('../codenames/codenames.js');
const router = express.Router();
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'second-folio-294223',
  keyFilename: path.join(__dirname, '../../games-with-friends-service-account-key.json')
});

router.post("/", (req, res, next) => {
  console.log("Login Request", req.body);
  const name = req.body.name;
  const nickname = req.body.nickname;
  const email = req.body.email;
  const id = req.body.id;

  const usersRef = db.collection('users').doc(id);

  usersRef.get()
    .then(docSnapshot => {
      if (docSnapshot.exists) {
        console.log("login already exists");
      } else {
        usersRef.set({
          name: name,
          nickname: nickname,
          email: email,
          id: id
        });
      }
    })
  

  res.send("hello from login!");
});

// Get match history
router.get("/history", (req, res, next) => {
  let id = req.query.id;
  console.log("REQUEST", req)

  console.log("GETTING MATCH HISTORY!", req.query.id);

  const docRef = db.collection('users').doc(id);

  docRef.get()
    .then(doc => {
      if (doc.exists) {
        res.send(doc.data());
      } else {
        res.send("ID does not exist");
      }
    })
    .catch(err => {
      console.log(err);
    })
});

// Get friend (search on FE)
router.post("/addFriend", (req, res, next) => {
  let userId = req.body.userId;
  let friendId = req.body.friendId;

  var userRef = db.collection('users').doc(userId);

  // Append friend to friend field in DB
  userRef.update({
    friend: Firestore.FieldValue.arrayUnion(friendId)
  });

});

module.exports = router;