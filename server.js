//============settings====
var listen_port = 8000;

//============================

var app = require('http').createServer(handler)
var io = require('socket.io')(app);

app.listen(listen_port);

var id=0;
var process_responses = {};

var get_id = function(req){
    req.id=id;
    id++;
};

var process_request = function(req, res){
  req_content = {
      method: req.method,
      url: req.url,
      body: req.body,
      id: req.id,
      headers: req.headers
  };
  console.log("Emit to clients:");
  console.log(req_content);
  io.emit('request', req_content);
  process_responses[req.id] = res;
  setTimeout(function(){
    if( req.id in process_responses){
        delete process_responses[req.id];
        res.write('');
        res.end();
        console.log("Request id:" + req.id + "Timeout! Disconnect!");
    }
  }, 5000);
};


function handler(req, res) {
    var body = undefined;
    var isBuffer = false;
    var chunk_array = [];
    get_id(req);

    res.on('data', function(chunk){
            if( isBuffer || Buffer.isBuffer(chunk)){
                isBuffer = true;
                chunk_array[chunk_array.length] = chunk;
                return;
            }            
            if(body == undefined){
                body=chunk;
            } else {
                body += chunk;
            }
        });

   
    req.on('end', function(){
        if ( isBuffer ) {
            body = Buffer.concat(chunk_array);
        }
        req.body = body;
        process_request(req, res);
    });
}


//==== sockit.io =====
io.on('connection', function (socket) {
  socket.emit('connect_success', { hello: 'world' });
  console.log("Client Connected!");
  socket.on('response', function (data) {
    console.log("Receive From Client:");
    console.log(data);
    if( data.id in process_responses){
        res = process_responses[data.id];
        delete  process_responses[data.id];
        res.writeHead(data.statusCode, data.headers);
        if( data.response !== undefined){
            res.write(data.response);
        }
        res.end();
    }
  });
});
