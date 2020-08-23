const http = require('http');

http
  .createServer((request, response) => {
    let body = [];
    request
      .on('error', err => {
        console.error(err);
      })
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('body', body);
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(
          `<html>
  <head>
    <style>
      #container {
        width: 500px;
        height: 300px;
        display: flex;
        background-color: rgb(255, 255, 255);
      }
      #container #myid {
        width: 200px;
        height: 100px;
        background-color: rgb(255, 0, 0);
      }
      #container .c1 {
        flex: 1;
        background-color: rgb(111, 222, 111);
      }
    </style>
  </head>
  <body>
      <div id="container">
        <div id="myid" />
        <div class="c1"/>
      </div>
  </body>
</html>`
        );
      });
  })
  .listen(8888);

console.log('server started');