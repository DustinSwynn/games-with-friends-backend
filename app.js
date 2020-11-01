const http = require('http');
const fs = require('fs');
const codenames = require('./codenames/codenames');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {

  // Temporary
  switch(req.url) {

    case '/codenames.html':

      var codenamesPage = fs.readFileSync('codenames/codenames.html');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(codenamesPage);
      console.log(codenames.master_words_list);
      break;

    case '/codenames_styles.css':

      var codenamesStyles = fs.readFileSync('codenames/codenames_styles.css');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/css');
      res.end(codenamesStyles);
      break;

    case '/codenames_script.js':

      var codenamesScript = fs.readFileSync('codenames/codenames_script.js');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/javascript');
      res.end(codenamesScript);
      break;

    default:

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Hello World');

  }

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  codenames.readWords()
});
