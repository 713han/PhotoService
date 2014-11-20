var	
	Async = require('async'),
	Mongodb = require('mongodb'),
	UUID = require('node-uuid'),
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
				callback(err, 'DALMongodbPhoto.connectMongoDB:connection');
			}else{
				callback(null, db);
			}
		});
	},
	function(db, callback) { 
		db.collection(collectionName, function(err, collection) {		
			if (err) {
				callback(err, 'DALMongodbPhoto.connectMongoDB:collection');
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
	
var DALMongodbPhoto = function(){	
	this.connectionString = Config.MongoDBConn;
	this.collectionName = 'PhotoData';
}

/*
 * result:function(err, data);
 */
DALMongodbPhoto.prototype.insertPhotoData = function(photoDataObj, result){
	var connectString = this.connectionString;
	var collectName = this.collectionName;
	
	var uuidBinary = new Buffer(UUID.parse(photoDataObj.strID));
	var id = Mongodb.BSONPure.Binary(uuidBinary, Mongodb.BSONPure.Binary.SUBTYPE_UUID);
	
	var ts = new Date().getTime();
	var i = ts % 1000;
	var t = new Mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));
	
	photoDataObj._id = id;
	photoDataObj.createDate = t;	
	
	Async.waterfall([
	function(callback) { 
		connectMongoDB(connectString, collectName, function(err, db, collection){
			if(err){
				callback(err, 'DALMongodbPhoto.insertPhotoData:connectMongoDB')
			}else{
				callback(null, db, collection);
			}
		})
	},
	function(db, collection, callback) { 
		collection.insert(photoDataObj, function(err, data) {	
			if (err) {
				callback(err, 'DALMongodbPhoto.insertPhotoData:insert');
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
DALMongodbPhoto.prototype.removePhotoData = function(strID, result){
	var connectString = this.connectionString;
	var collectName = this.collectionName;
	
	var id = convertStrID2BinID(strID);
	var deleteObj = {_id : id};
	
	Async.waterfall([
	function(callback) { 
		connectMongoDB(connectString, collectName, function(err, db, collection){
			if(err){
				callback(err, 'DALMongodbPhoto.removePhotoData:connectMongoDB')
			}else{
				callback(null, db, collection);
			}
		})
	},
	function(db, collection, callback) { 
		collection.remove(deleteObj, function(err, data) {	
			if (err) {
				callback(err, 'DALMongodbPhoto.removePhotoData:remove');
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
DALMongodbPhoto.prototype.updatePhotoData = function(strID, result){
	var connectString = this.connectionString;
	var collectName = this.collectionName;
	
	var id = convertStrID2BinID(strID);
	var ts = new Date().getTime();
	var i = ts % 1000;
	var t = new Mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));	
	
	var updateObj = {_id : id};	
	var updateSetObj = {$set:{createDate : t}};
	
	Async.waterfall([
	function(callback) { 
		connectMongoDB(connectString, collectName, function(err, db, collection){
			if(err){
				callback(err, 'DALMongodbPhoto.updatePhotoData:connectMongoDB')
			}else{
				callback(null, db, collection);
			}
		})
	},
	function(db, collection, callback) { 
		collection.update(updateObj, updateSetObj, function(err, data) {	
			if (err) {
				callback(err, 'DALMongodbPhoto.updatePhotoData:update');
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
DALMongodbPhoto.prototype.getPhotoData = function(strID, result){
	var connectString = this.connectionString;
	var collectName = this.collectionName;
	
	var id = convertStrID2BinID(strID);	
	var selectObj = {_id : id};	
	
	Async.waterfall([
	function(callback) { 
		connectMongoDB(connectString, collectName, function(err, db, collection){
			if(err){
				callback(err, 'DALMongodbPhoto.getPhotoData:connectMongoDB')
			}else{
				callback(null, db, collection);
			}
		})
	},
	function(db, collection, callback) { 
		collection.find(selectObj).toArray(function(err, data) {	
			if (err) {
				callback(err, 'DALMongodbPhoto.getPhotoData:find');
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
DALMongodbPhoto.prototype.getPhotoDataList = function(result) {
	var connectString = this.connectionString;
	var collectName = this.collectionName;
	
	Async.waterfall([
	function(callback) { 
		connectMongoDB(connectString, collectName, function(err, db, collection){
			if(err){
				callback(err, 'DALMongodbPhoto.getPhotoDataList:connectMongoDB')
			}else{
				callback(null, db, collection);
			}
		})
	},
	function(db, collection, callback) { 
		collection.find().toArray(function(err, data) {	
			if (err) {
				callback(err, 'DALMongodbPhoto.getPhotoDataList:find');
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

module.exports = DALMongodbPhoto;