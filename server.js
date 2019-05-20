var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var pimp = require('./routes/pimp');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
 
app.get('/pimp', pimp.findAll);
app.get('/pimp/:id', pimp.findById);
app.post('/pimp', pimp.addItem);
app.put('/pimp/:id', pimp.updateItem);
app.delete('/pimp/:id', pimp.deleteItem);

var port = 7137;
console.log('Listening on port '+port+'...');
app.listen(port);
