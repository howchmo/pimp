var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;

var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('pimp', server);

db.open(function(err, db)
{
	if(!err)
	{
		console.log("Connected to 'pimp' database");
		db.collection('items', {strict:true}, function(err, collection)
		{
			if (err)
			{
				console.log("The 'items' collection doesn't exist. Creating it with sample data...");
				populateDB();
			}
		});
	}
});

exports.findById = function(req, res)
{
	var id = req.params.id;
	console.log('Retrieving item: ' + id);
	db.collection('items', function(err, collection)
	{
		var oid = new ObjectID(id);
		collection.find({'_id':oid}).limit(1).next( function(err, item)
		{
			res.send(item);
		});
	});
};

exports.findAll = function(req, res)
{
	db.collection('items', function(err, collection)
	{
		collection.find().toArray(function(err, items)
		{
			res.send(items);
		});
	});
};

exports.addItem = function(req, res)
{
	var item = JSON.parse(req.body.string);
	console.log("addItem( title = '"+item.title+"')");
	db.collection('items').insertOne ( item, function( err, result )
	{
		console.log('Success:');
		console.log('     ' + result.insertedId);
		res.send(result.insertedId);
	});
}
 
exports.updateItem = function(req, res)
{
	var id = req.params.id;
	var item = JSON.parse(req.body["string"]);
	console.log("Update item: " +id + " : "+ JSON.stringify(item));
	db.collection('items').updateOne({'_id':ObjectID(id)}, item, {safe:true},
		function(err, result)
		{
			if (err)
			{
				console.log('Error updating item: ' + err);
				res.send({'error':'An error has occurred'});
			}
			else
			{
				console.log('' + result + ' document(s) updated');
				item._id = id;
				console.log(JSON.stringify(item));
				res.send(item);
			}
		}
	);
}
 
exports.deleteItem = function(req, res)
{
	var id = req.params.id;
	console.log('Deleting item: ' + id);
	db.collection('items', function(err, collection) {
	collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true},
		function(err, result)
		{
			if (err)
			{
				res.send({'error':'An error has occurred - ' + err});
			}
			else
			{
				console.log('' + result + ' document(s) deleted');
				res.send(req.body);
			}
		});
	});
}
 
/*------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function()
{
	db.collection('items', function(err, collection)
	{
		collection.insert(startItems, {safe:true}, function(err, result) {});
	});
};
