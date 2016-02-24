//========= settings
var use_proxy = true;
var _debug = false;
var local_port = 8000;
var server_url = 'http://114.215.208.174:8001';
var proxy_host = '10.112.13.174';
var proxy_port = 3128;

//==============================
var http = require('http');
var __request = http.request;

var proxy = {
    host: proxy_host ,
    port: proxy_port
};
 
 
http.request = function (options, callback) {
    var __options = options;
    __options.path = 'http://' + options.host + ":" + options.port + options.path;
    __options.host = proxy.host;
    __options.port = proxy.port;
    if (_debug) {
        console.log('=== http-proxy.js begin debug ===');
        console.log(JSON.stringify(__options, null, 2));
        console.log('=== http-proxy.js end debug ===');
    }
    var req = __request(__options, function (res) {
        if( callback !== undefined){
            callback(res);
        }
    });
    return req;
};

if( !use_proxy){
    http.request = __request;
}
util = require('util');
var process_request = function(data){
    console.log("Receive From Server:");
    console.log(data);
    var body = undefined;
    var chunk_array=[];
    var isBuffer = false;
    var req = __request({
        port: local_port,
        method: data.method,
        path: data.url,
        headers: data.headers
    }, function(res){
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
        res.on('end', function(){
           // if( res.statusCode == 404){
           //     console.log("Error 404, Not Send Back To Server!");
           //     return;
           // }
            if( isBuffer ){
                body = Buffer.concat(chunk_array);
            }
            response = { 
                id: data.id,
                response: body,
                headers: res.headers,
                statusCode: res.statusCode
            };
            console.log('Emit to Server:');
            console.log(util.inspect(response));
            socket.emit('response', response);
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    if( data.body !== undefined){
        req.write(data.body);
    }
    req.end();
}


// ====== socket.io begin ===

var socket = require('socket.io-client')(server_url);
socket.on('connect', function(){
    socket.on('connect_success', function(data){
        console.log("Connect Success!");
    });
    socket.on('request', function(data){
        process_request(data);
    });
});

