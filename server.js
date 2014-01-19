var express = require('express');
var app = express();

app.configure(function() {
  app.use(express.compress());
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(app.router);
});

app.use(express.static(__dirname + "/build"));

var port = 8888;
app.listen(port);
console.log('Listening on port ' + port);