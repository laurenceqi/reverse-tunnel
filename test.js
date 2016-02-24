var request = require('request')


request(
    { method: 'GET'
    , uri: 'http://localhost:8000/abc' 
    , body: "testBody"
    }
  , function (error, response, body) {
      console.log('error: '+ response.statusCode)
      console.log(body)
    }
  );
request(
    { method: 'POST'
    , uri: 'http://localhost:8000/abc' 
    , body: "testBody"
    }
  , function (error, response, body) {
      console.log('error: '+ response.statusCode)
      console.log(body)
    }
  );
