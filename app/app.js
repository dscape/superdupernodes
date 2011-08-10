
/**
 * Module dependencies.
 */

var express = require('express')
  , cfg     = require('../cfg/express')
  , app     = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.send("a");
});

app.listen(cfg.port, cfg.host);
console.log("Listening on host %s, port %d in %s mode", cfg.host, cfg.port, app.settings.env);
