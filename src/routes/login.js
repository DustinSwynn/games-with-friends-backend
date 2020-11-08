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

module.exports = router;