const http = require('http')

http.createServer((req, res) => {
  let body = []
  req.on('error', (err) => {
    console.log(err)
  }).on('data', (chunk) => {
    console.log(chunk)
  }).on('end', () => {
    body = Buffer.concat(body).toString()
    console.log('body:' + body)
    res.writeHead(200, {'Content-Type': 'txt/html'})
    res.end('hello world\n')
  })
}).listen(8888)