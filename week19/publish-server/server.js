const http = require('http')
const https = require('https')
const unzipper = require('unzipper')
const querystring = require('querystring')

// auth路由，接受code，用code+client_id+client_secret换取token
function auth(request, response) {
const querystring = require('querystring')
  // 拿到code值 { code: '81089926d2f103c0cc31' }
  const query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/)[1])
  getToken(query.code, (info) => {
    // response.write(JSON.stringify(info))
    response.write(`<a href="http://localhost:8083/?token=${info.access_token}">publish</a>`)
    console.log(info)
    response.end()
  })
}

// 用token拿用户信息，检查权限
function getToken(code, callback) {
  const request = https.request({
    hostname: 'github.com',
    path: `/login/oauth/access_token?code=${code}&client_id=Iv1.6db515dbee921e0a&client_secret=2437926caf39edc44528422f47f99d71a3a15be0`,
    port: 443,
    method: 'post'
  }, (response) => {
    let body = ''
    response.on('data', chunk => {
      body += chunk.toString()
    })

    response.on('end', chunk => {
      callback(querystring.parse(body))
    })
  })

  request.end()
}


// publish路由接收发布
function publish(request, response) {
  const query = querystring.parse(request.url.match(/^\/publish\?([\s\S]+)$/)[1])
  getUser(query.token, info => {
    if(info.login === 'zhutianlong95') {
      request.pipe(unzipper.Extract({ path: '../server/public/'}))
      request.on('end', () => {
        response.end('publish success')
      })
    }
  })
}

// 获取用户信息
function getUser(token, callback) {
  const request = https.request({
    hostname: 'api.github.com',
    path: `/user`,
    port: 443,
    method: 'get',
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'ztl-publish'
    }
  }, (response) => {
    let body = ''
    response.on('data', chunk => {
      body += chunk.toString()
    })

    response.on('end', chunk => {
      callback(JSON.parse(body))
    })
  })

  request.end()
}

http.createServer((request, response) => {
  if(request.url.match(/^\/auth\?/)) {
    return auth(request, response)
  }
  if(request.url.match(/^\/publish\?/)) {
    return publish(request, response)
  }

  // const outFile = fs.createWriteStream('../server/public/temp.zip')
  // request.pipe(unzipper.Extract({ path: '../server/public/'}))

}).listen(8082)