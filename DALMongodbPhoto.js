var DALMongodbPhoto = (function(o){
	"use strict";
	
	var
		config,
		mongodb,
		mongoDbClient,
		connectStr,
		uuid,
		utilObj;	
	
	o.init = function(){
		initOnce();
		bindEvent();		
	}
	
	var initOnce = function(){
		config = require('./config');
		mongodb = require('mongodb');
		mongoDbClient = mongodb.MongoClient;
		connectStr = config.MongoDBConn;
		uuid = require('node-uuid');
		utilObj = require('./UtilObject');
	}
	
	var bindEvent = function(){
		
	}
	
	o.PhotoData = function(){
		var obj = {};
		
		obj._id = 0;
		obj.strID = '';
		obj.path = '';
		obj.filename = '';
		obj.url = '';
		obj.createDate = '';
		obj.exif = {};
		
		obj.set = function(id, path, filename, url, exif, callback){
			obj.strID = id;
			obj.path = path;
			obj.filename = filename;
			obj.url = url;
			obj.exif = exif;
			
			callback(obj);
		}
		
		return obj;
	}
	
	o.insertPhotoData = function(insertObj, callback){
		var status = new utilObj.statusObj();
		
		var uuidBinary = new Buffer(uuid.parse(insertObj.strID));
		var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);
		
		var ts = new Date().getTime();
		var i = ts % 1000;
		var t = new mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));
		
		insertObj._id = id;
		insertObj.createDate = t;
		
		mongoDbClient.connect(connectStr, function(err, db) {
			if(err) throw err;
			db.collection('PhotoData', function(err, collection) {				
				collection.insert(insertObj, function(err, data) {					
					if (data) {										
						status.set(true, '', data, function(obj){
							callback(obj);
						});
					} else {
						status.set(false, 'Failed to inserted', data, function(obj){
							callback(obj);
						});
					}
					
					db.close();
				});				
			});			
		});
	}
	
	o.removePhotoData = function(strID, callback){
		var status = new utilObj.statusObj();
		
		var uuidBinary = new Buffer(uuid.parse(strID));
		var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);
		
		mongoDbClient.connect(connectStr, function(err, db) {
			if(err) throw err;
			db.collection('PhotoData', function(err, collection) {				
				collection.remove({_id : id}, function(err, data) {	
					if (data) {										
						status.set(true, '', data, function(obj){
							callback(obj);
						});
					} else {
						status.set(false, 'Failed to removed', data, function(obj){
							callback(obj);
						});
					}
					
					db.close();
				});				
			});			
		});
	}
	
	//SAVE:_id一樣等同update的修改文件，沒有ID則新增
	//參考:http://mongodb.github.io/node-mongodb-native/markdown-docs/insert.html
	o.savePhotoData = function(strID, callback){
		var status = new utilObj.statusObj();
		
		var uuidBinary = new Buffer(uuid.parse(strID));
		var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);
		
		var ts = new Date().getTime();
		var i = ts % 1000;
		var t = new mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));
		
		mongoDbClient.connect(connectStr, function(err, db) {
			if(err) throw err;
			db.collection('PhotoData', function(err, collection) {				
				collection.save({_id : id, createDate : t}, function(err, data) {	
					if (data) {										
						status.set(true, '', data, function(obj){
							callback(obj);
						});
					} else {
						status.set(false, 'Failed to saved', data, function(obj){
							callback(obj);
						});
					}
					
					db.close();
				});				
			});			
		});
	}
	
	o.updatePhotoData = function(strID, callback){
		var status = new utilObj.statusObj();
		
		var uuidBinary = new Buffer(uuid.parse(strID));
		var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);
		
		var ts = new Date().getTime();
		var i = ts % 1000;
		var t = new mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));
		
		mongoDbClient.connect(connectStr, function(err, db) {
			if(err) throw err;
			db.collection('PhotoData', function(err, collection) {				
				collection.update({_id : id}, {$set:{createDate : t}}, function(err, data) {	
					if (data) {										
						status.set(true, '', data, function(obj){
							callback(obj);
						});
					} else {
						status.set(false, 'Failed to updated', data, function(obj){
							callback(obj);
						});
					}
					
					db.close();
				});				
			});			
		});
	}
	
	o.getPhotoData = function(strID, callback){
		var status = new utilObj.statusObj();
		
		var uuidBinary = new Buffer(uuid.parse(strID));		
		var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);		
		
		mongoDbClient.connect(connectStr, function(err, db) {
			if(err) throw err;
			db.collection('PhotoData', function(err, collection) {			
				collection.find({_id : id}).toArray(function(err, data) {
					if (data) {									
						status.set(true, '', data, function(obj){
							callback(obj);
						});
					} else {
						status.set(false, 'Cannot found', data, function(obj){
							callback(obj);
						});
					}	
					db.close();
				});	
			});	
		});
	}
	
	o.getPhotoDataList = function(callback){
		var status = new utilObj.statusObj();
		mongoDbClient.connect(connectStr, function(err, db) {
			if(err) throw err;
			db.collection('PhotoData', function(err, collection) {			
				collection.find().toArray(function(err, data) {
					if (data) {									
						status.set(true, '', data, function(obj){
							callback(obj);
						});
					} else {
						status.set(false, 'Cannot found', data, function(obj){
							callback(obj);
						});
					}	
					db.close();
				});	
			});	
		});
	}
	
	return o;
	
})( DALMongodbPhoto || {} );

module.exports = DALMongodbPhoto;