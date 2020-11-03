const http = require('http');
const express = require('express');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const codenames = require('./src/codenames/codenames');
const setHeaders = require('./src/middlewares/setHeaders');
const codenamesRouter = require('./src/routes/codenames');

const app = express();
// const hostname = '127.0.0.1';
const port = 8080;

app.use(setHeaders);
app.use(express.json());
app.set("port", port);

// const server = http.createServer((req, res) => {

//   // Temporary
//   switch(req.url) {

//     case '/codenames.html':

//       var codenamesPage = fs.readFileSync('codenames/codenames.html');
//       res.statusCode = 200;
//       res.setHeader('Content-Type', 'text/html');
//       res.end(codenamesPage);
//       var game = new codenames.codenames();
//       console.log(game);
//       console.log(game.getGrid());
//       console.log(game.getMap());
//       break;

//     case '/codenames_styles.css':

//       var codenamesStyles = fs.readFileSync('codenames/codenames_styles.css');
//       res.statusCode = 200;
//       res.setHeader('Content-Type', 'text/css');
//       res.end(codenamesStyles);
//       break;

//     case '/codenames_script.js':

//       var codenamesScript = fs.readFileSync('codenames/codenames_script.js');
//       res.statusCode = 200;
//       res.setHeader('Content-Type', 'text/javascript');
//       res.end(codenamesScript);
//       break;

//     default:

//       res.statusCode = 200;
//       res.setHeader('Content-Type', 'text/plain');
//       res.end('Hello World');

//   }

// });

app.use("/", codenamesRouter);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  codenames.readWords();
});