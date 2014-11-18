var	
	async = require('async'),
	mongodb = require('mongodb'),
	uuid = require('node-uuid'),
	config = require('./config'),
	UtilObject = require('./UtilObject');
	Status = require('./Models/Status');	

var DALMongodbPhoto = function(){
	this.mongoDbClient = mongodb.MongoClient;
	this.connectStr = config.MongoDBConn;	
	this.utilObj = new UtilObject;
}

DALMongodbPhoto.prototype.insertPhotoData = function(photoDataObj, callback){
	var uuidBinary = new Buffer(uuid.parse(photoDataObj.strID));
	var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);
	
	var ts = new Date().getTime();
	var i = ts % 1000;
	var t = new mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));
	
	photoDataObj._id = id;
	photoDataObj.createDate = t;
	
	this.mongoDbClient.connect(this.connectStr, function(err, db) {
		if (err) {
			callback(err, 'DALMongodbPhoto.insertPhotoData:connection');
		}else{		
			db.collection('PhotoData', function(err, collection) {		
				if (err) {
					callback(err, 'DALMongodbPhoto.insertPhotoData:collection');
				}else{
					collection.insert(photoDataObj, function(err, data) {	
						if (err) {
							callback(err, 'DALMongodbPhoto.insertPhotoData:insert');
						}else{
							if (data) {										
								callback(null, '', true, data);
							} else {
								callback(null, 'Failed to inserted', false, data);
							}
						}
						db.close();
					});	
				}
			});	
		}
	});
}

DALMongodbPhoto.prototype.removePhotoData = function(strID, callback){
	var uuidBinary = new Buffer(uuid.parse(strID));
	var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);
	
	this.mongoDbClient.connect(this.connectStr, function(err, db) {
		if (err) {
			callback(err, 'DALMongodbPhoto.removePhotoData:connection');
		}else{
			db.collection('PhotoData', function(err, collection) {	
				if (err) {
					callback(err, 'DALMongodbPhoto.removePhotoData:collection');
				}else{
					collection.remove({_id : id}, function(err, data) {	
						if (err) {
							callback(err, 'DALMongodbPhoto.removePhotoData:remove');
						}else{							
							if (data) {									
								callback(null, '', true, data);
							} else {
								callback(null, 'Failed to removed', false, data);
							}
						}
						db.close();
					});	
				}
			});	
		}
	});
}

DALMongodbPhoto.prototype.updatePhotoData = function(strID, callback){
	var uuidBinary = new Buffer(uuid.parse(strID));
	var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);
	
	var ts = new Date().getTime();
	var i = ts % 1000;
	var t = new mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));
	
	this.mongoDbClient.connect(this.connectStr, function(err, db) {
		if (err) {
			callback(err, 'DALMongodbPhoto.updatePhotoData:connection');
		}else{		
			db.collection('PhotoData', function(err, collection) {	
				if (err) {
					callback(err, 'DALMongodbPhoto.updatePhotoData:collection');
				}else{
					//[collection.save]:_id一樣等同update的修改文件，沒有ID則新增
					//參考:http://mongodb.github.io/node-mongodb-native/markdown-docs/insert.html
					collection.update({_id : id}, {$set:{createDate : t}}, function(err, data) {	
						if (err) {
							callback(err, 'DALMongodbPhoto.updatePhotoData:update');
						}else{							
							if (data) {									
								callback(null, '', true, data);
							} else {
								callback(null, 'Failed to updated', false, data);
							}
						}
						db.close();
					});
				}
			});	
		}
	});
}

DALMongodbPhoto.prototype.getPhotoData = function(strID, callback){
	var uuidBinary = new Buffer(uuid.parse(strID));		
	var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);		
	
	this.mongoDbClient.connect(this.connectStr, function(err, db) {
		if (err) {
			callback(err, 'DALMongodbPhoto.getPhotoData:connection');
		}else{
			db.collection('PhotoData', function(err, collection) {	
				if (err) {
					callback(err, 'DALMongodbPhoto.getPhotoData:collection');
				}else{
					collection.find({_id : id}).toArray(function(err, data) {
						if (err) {
							callback(err, 'DALMongodbPhoto.getPhotoData:find');
						}else{
							if (data.length > 0) {									
								callback(null, '', true, data);
							} else {
								callback(null, 'Cannot found', false, data);
							}	
						}
						db.close();
					});	
				}
			});	
		}
	});
}

DALMongodbPhoto.prototype.getPhotoDataList = function(callback) {
	var status = new Status();
	this.mongoDbClient.connect(this.connectStr, function(err, db) {
		if (err) {
			callback(err, 'DALMongodbPhoto.getPhotoDataList:connection');
		}else{
			db.collection('PhotoData', function(err, collection) {
				if (err) {
					callback(err, 'DALMongodbPhoto.getPhotoDataList:collection');
				}else{
					collection.find().toArray(function(err, data) {
						if (err) {
							callback(err, 'DALMongodbPhoto.getPhotoDataList:find');							
						}else{
							if (data.length > 0) {
								callback(null, '', true, data);
							} else {
								callback(null, 'Cannot found', false, data);
							}
						}
						db.close();
					});
				}
			});
		}
	});
}

module.exports = DALMongodbPhoto;