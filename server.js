var express = require('express');
var fs = require('fs');
var https = require('https')
var bodyParser = require('body-parser');
var path = require('path');
var pimp = require('./routes/pimp');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/pimp', pimp.findAll);
app.get('/pimp/:id', pimp.findById);
app.post('/pimp', pimp.addItem);
app.put('/pimp/:id', pimp.updateItem);
app.delete('/pimp/:id', pimp.deleteItem);

var port = 443;

https.createServer({
	key: fs.readFileSync('pimp.key'),
	cert: fs.readFileSync('pimp.cert')
}, app)
.listen(port, function () {
	console.log('Listening on port '+port+'...');
});
