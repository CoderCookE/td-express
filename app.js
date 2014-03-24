
/**
 * Module dependencies.
 */

var express = require('express');
var swig = require('swig');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();
app.engine('html', swig.renderFile);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// express middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  swig.setDefaults({ cache: false });
}

app.get('/', routes.index);
app.get('/test', routes.create);
app.post('/run_test', routes.run_test);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
