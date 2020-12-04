const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const codenames = require('./src/codenames/codenames');
const setHeaders = require('./src/middlewares/setHeaders');
const codenamesRouter = require('./src/routes/codenames');
const profileRouter = require('./src/routes/profile');

const app = express();
// const hostname = '127.0.0.1';
const port = 8080;

app.use(setHeaders);
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("port", port);

app.use("/codenames", codenamesRouter);
app.use("/api/profile", profileRouter);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  codenames.readWords();
});
