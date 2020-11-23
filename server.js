var express = require('express');
var fs = require('fs');
var https = require('https')
var bodyParser = require('body-parser');
var path = require('path');
var pimp = require('./routes/pimp');

var app = express();
// Serve static files
const serveIndex = require('serve-index');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/stuph', express.static('public/stuff'), serveIndex('public/stuff', {'icons': true})); 

app.use(bodyParser.json({ limit: "5000mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/pimp', pimp.findAll);
app.get('/pimp/:id', pimp.findById);
app.post('/pimp', pimp.addItem);
app.post('/upload', pimp.uploadFile);
app.put('/pimp/:id', pimp.updateItem);
app.put('/pimp/prepend/:id', pimp.prependToItem);
app.put('/pimp/append/:id', pimp.appendToItem);
app.delete('/pimp/:id', pimp.deleteItem);

var port = 443;

https.createServer({
	key: fs.readFileSync('pimp.key'),
	cert: fs.readFileSync('pimp.crt')
}, app)
.listen(port, function () {
	console.log('Listening on port '+port+'...');
});
