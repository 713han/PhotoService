var	
	Async = require('async'),
	Mongodb = require('mongodb'),
	ObjectID = require('mongodb').ObjectID,
	Config = require(appRoot + '/config'),
	UtilObject = require(appRoot + '/Models/UtilObject');
	
var 
	mongoDbClient = Mongodb.MongoClient;
	utilObj = new UtilObject();

var convertStrID2BinID = function(strID){
	var uuidBinary = new Buffer(UUID.parse(strID));
	var id = Mongodb.BSONPure.Binary(uuidBinary, Mongodb.BSONPure.Binary.SUBTYPE_UUID);
	return id;
}

/*
 * result:function(err, db, collection);
 */
var connectMongoDB = function(connectionString, collectionName, result){	
	Async.waterfall([
	function(callback) { 
		mongoDbClient.connect(connectionString,function(err,db){
			if (err) {
				callback(err, 'DALMongodbGPS.connectMongoDB:connection');
			}else{
				callback(null, db);
			}
		});
	},
	function(db, callback) { 
		db.collection(collectionName, function(err, collection) {		
			if (err) {
				callback(err, 'DALMongodbGPS.connectMongoDB:collection');
			}else{
				result(null, db, collection);
				callback(null, 'Done');
			}
		});
	}], function (err, resultObj) {		
		if(err){
			var obj = {
					err : err,
					result : resultObj
			};
			result(obj, null, null);
		}
	});
}
	
var DALMongodbGPS = function(){	
	this.connectionString = Config.MongoDBConn;
	this.collectionName = 'GPSData';
}

/*
 * result:function(err, data);
 */
DALMongodbGPS.prototype.insert = function(gpsDataObj, result){
	var connectString = this.connectionString;
	var collectName = this.collectionName;	
	
	var timestamp = Math.floor(new Date().getTime()/1000);
	var id = new ObjectID(timestamp);
	
	gpsDataObj._id = id;	
	
	Async.waterfall([
	function(callback) { 
		connectMongoDB(connectString, collectName, function(err, db, collection){
			if(err){
				callback(err, 'DALMongodbGPS.insert:connectMongoDB')
			}else{
				callback(null, db, collection);
			}
		})
	},
	function(db, collection, callback) { 
		collection.insert(gpsDataObj, function(err, data) {	
			if (err) {
				callback(err, 'DALMongodbGPS.insert:insert');
			}else{
				result(null, data);
				callback(null, 'Done');
			}
			db.close();
		});	
	}], function (err, resultObj) {		
			if(err){
				var obj = {
						err : err,
						result : resultObj
				};
				result(obj, null);
			}
	});
}

/*
 * result:function(err, data);
 */
DALMongodbGPS.prototype.get = function(strID, result){
	var connectString = this.connectionString;
	var collectName = this.collectionName;	
	
	var selectObj = { _id : ObjectID.createFromHexString(strID) };
	
	Async.waterfall([
	function(callback) { 
		connectMongoDB(connectString, collectName, function(err, db, collection){
			if(err){
				callback(err, 'DALMongodbGPS.get:connectMongoDB')
			}else{
				callback(null, db, collection);
			}
		})
	},
	function(db, collection, callback) { 
		collection.find(selectObj).toArray(function(err, data) {	
			if (err) {
				callback(err, 'DALMongodbGPS.get:find');
			}else{
				result(null, data);
				callback(null, 'Done');
			}
			db.close();
		});	
	}], function (err, resultObj) {		
			if(err){
				var obj = {
						err : err,
						result : resultObj
				};
				result(obj, null);
			}
	});
}

/*
 * result:function(err, data);
 */
DALMongodbGPS.prototype.getList = function(result) {
	var connectString = this.connectionString;
	var collectName = this.collectionName;
	
	var selectField = { _id:1 };
	
	Async.waterfall([
	function(callback) { 
		connectMongoDB(connectString, collectName, function(err, db, collection){
			if(err){
				callback(err, 'DALMongodbGPS.getList:connectMongoDB')
			}else{
				callback(null, db, collection);
			}
		})
	},
	function(db, collection, callback) { 
		collection.find(null, selectField).toArray(function(err, data) {	
			if (err) {
				callback(err, 'DALMongodbGPS.getList:find');
			}else{
				result(null, data);
				callback(null, 'Done');
			}
			db.close();
		});	
	}], function (err, resultObj) {		
			if(err){
				var obj = {
						err : err,
						result : resultObj
				};
				result(obj, null);
			}
	});
}

module.exports = DALMongodbGPS;