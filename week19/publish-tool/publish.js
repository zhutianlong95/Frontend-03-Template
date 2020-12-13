const http = require('http')
const fs = require('fs')
const archiver = require('archiver')
const child_process = require('child_process')
const querystring = require('querystring')


// 打开github登录页面
child_process.exec(`open https://github.com/login/oauth/authorize?client_id=Iv1.6db515dbee921e0a`)

// 创建server，接收token
http.createServer((request, response) => {
  const query = querystring.parse(request.url.match(/^\/\?([\s\S]+)$/)[1])
  publish(query.token)
}).listen(8083)

function publish(token) {
  const request = http.request({
    hostname: '127.0.0.1',
    port: 8082,
    method: 'post',
    path: `/publish?token=${token}`,
    headers: {
      'Content-Type': 'application/octet-stream', // 常见的流式传输的内容类型
      // 'Content-Length': stats.size
    }
  }, response => {
    console.log(response)
  })

  // const file = fs.createReadStream('./sample.html')

  const archive = archiver('zip', {
    zlib: {
      level: 9
    }
  })

  archive.directory('./sample/', false)
  archive.finalize() // 填写压缩内容完毕

  archive.pipe(request)
}


// archive.pipe(fs.createWriteStream('temp.zip'))

//file.pipe(request)

//file.on('end', () => {
//  request.end()
//})

