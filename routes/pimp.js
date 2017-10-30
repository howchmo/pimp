var fs = require('fs');
var mongoKeys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));

var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;

var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;

var userPassword = "";
console.log("\""+(mongoKeys.mongoUser != undefined)+"\"");
if( mongoKeys.mongoUser != "" || mongoKeys.mongoUser == undefined )
{
	userPassword = mongoKeys.mongoUser;
	if( mongoKeys.mongoPassword != "" || mongoKeys.mongoPassword == undefined )
		userPassword += ':'+mongoKeys.mongoPassword;
	userPassword += '@';
}
var mongoUri = 'mongodb://'+userPassword+mongoKeys.mongoHost+":"+mongoKeys.mongoPort+'/'+mongoKeys.mongoDatabase;
var items;
mongo.MongoClient.connect(mongoUri, function( err, db )
{
	console.log("Mongo connect: "+mongoUri);
	if(!err)
	{
		console.log("Connected to 'pimp' database");
		db.collection('items', {strict:true}, function(err, collection)
		{
			if (err)
			{
				console.log("The 'items' collection doesn't exist. Creating it with sample data...");
				populateDB(db);
			}
			else
			{
				items = collection;
			}
		});
	}
	else
		console.log("Problem opening database"+err);
});

exports.findById = function(req, res)
{
	console.log(items);
	var id = req.params.id;
	console.log('Retrieving item: ' + id);
	var oid = new ObjectID(id);
	items.find({'_id':oid}).limit(1).next( function(err, item)
	{
		res.send(item);
	});
};

exports.findAll = function(req, res)
{
	items.find().toArray(function(err, items)
	{
		if( err )
			console.log("ERROR");
		else
			res.send(items);
	});
};

exports.addItem = function(req, res)
{
	var item = JSON.parse(req.body.string);
	console.log("addItem( title = '"+item.title+"')");
	items.insertOne ( item, function( err, result )
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
	items.updateOne({'_id':ObjectID(id)}, item, {safe:true},
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
	items.remove({'_id':new BSON.ObjectID(id)}, {safe:true},
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
}

var startItems={"_id":ObjectID("000000000000000000000000"),"title":"P.I.M.P","doc":[{"title":{"text":"P.I.M.P.","born":"2011-04-04T04:04:04.004Z"}}]};
/*------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function(db)
{
		items = db.collection("items");
		items.insert(startItems, {safe:true}, function(err, result) {});
};
