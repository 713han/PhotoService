var DALPhoto = (function(o){
	"use strict";
	
	var
		mongodb,
		mongoDbClient,
		connectStr,
		uuid;
	
	o.init = function(){
		initOnce();
		bindEvent();		
	}
	
	var initOnce = function(){
		mongodb = require('mongodb');
		mongoDbClient = mongodb.MongoClient;
		connectStr = 'mongodb://127.0.0.1:27017/PhotoService';
		uuid = require('node-uuid');
	}
	
	var bindEvent = function(){
		
	}
	
	o.statusObj = function(){
		var obj = {};		
		
		obj.status = false;
		obj.msg = '';
		obj.Object = {};
		
		obj.set = function(status, msg, data, callback){
			obj.status = status;
			obj.msg = msg;
			obj.Object = data;
			
			callback(obj);
		}
		
		return obj;
	}
	
	o.PhotoData = function(){
		var obj = {};
		
		obj._id = 0;
		obj.strID = '';
		obj.path = '';
		obj.filename = '';
		obj.url = '';
		obj.createDate = '';
		
		obj.set = function(id, path, filename, url, callback){
			obj.strID = id;
			obj.path = path;
			obj.filename = filename;
			obj.url = url;
			
			callback(obj);
		}
		
		return obj;
	}
	
	o.insertPhotoData = function(insertObj, callback){
		var status = new o.statusObj();
		
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
		var status = new o.statusObj();
		
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
	
	//SAVE:_id一樣等同update的賦改文件，沒有ID則新增
	//參考:http://mongodb.github.io/node-mongodb-native/markdown-docs/insert.html
	o.savePhotoData = function(strID, callback){
		var status = new o.statusObj();
		
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
		var status = new o.statusObj();
		
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
		var status = new o.statusObj();
		
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
		var status = new o.statusObj();
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
	
})( DALPhoto || {} );

module.exports = DALPhoto;