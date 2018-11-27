var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]
var qiniu = require('qiniu')
var port = 8002

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf('?'))
  }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method
  
  /******** 从这里开始看，上面不要看 ************/
  
  console.log('方方说：含查询字符串的路径\n' + pathWithQuery)
  
  if (path === '/uptoken') {
    // 一旦上传请求过来， 就把 请求里面的数据上传到 七牛的仓库
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.removeHeader('Date')
    
    var config = fs.readFileSync('./qiniu-config.json')
    // 这个json文件里面 的id 能定位到我的七牛账户
    // 这个id 是私密信息 不能上传
    
    config = JSON.parse(config)
    
    let {accessKey, secretKey} = config;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var options = {
      scope: '163-music',
      // scope: 我的七牛账户上的 163-music数据仓库
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    response.write(`
     {
     "uptoken": "${uploadToken}"
     }
     `)
    response.end()
  } else {
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(`
      {
        "error": "not found"
      }
    `)
    response.end()
  }
  
  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)

