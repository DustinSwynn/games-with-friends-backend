const http = require('http');
const express = require('express');
const fs = require('fs');

const codenames = require('./src/codenames/codenames');
const setHeaders = require('./src/middlewares/setHeaders');
const codenamesRouter = require('./src/routes/codenames');
const loginRouter = require('./src/routes/login');

const app = express();
// const hostname = '127.0.0.1';
const port = 8080;

app.use(setHeaders);
app.use(express.json());
app.set("port", port);

app.use("/codenames", codenamesRouter);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  codenames.readWords();
});
