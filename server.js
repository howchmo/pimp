var path = require('path')
var express = require('express'),
pimp = require('./routes/pimp');

var app = express();

//app.configure(function () {
//	app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
//	app.use(express.bodyParser());
//});


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
 
app.get('/pimp', pimp.findAll);
app.get('/pimp/:id', pimp.findById);
app.post('/pimp', pimp.addItem);
app.put('/pimp/:id', pimp.updateItem);
app.delete('/pimp/:id', pimp.deleteItem);

app.listen(3000);
console.log('Listening on port 3000...');
