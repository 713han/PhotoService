var DALPhoto = (function(o){
	"use strict";
	
	var
		mongodb,
		mongoDbClient,
		db,
		uuid;
	
	o.init = function(){
		initOnce();
		bindEvent();		
	}
	
	var initOnce = function(){
		mongodb = require('mongodb');
		mongoDbClient = require('mongodb').MongoClient;
		mongoDbClient.connect('mongodb://127.0.0.1:27017/PhotoService', function(err, database) {
			if(err) throw err;
			db = database;
		})
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
		obj.path = '';
		obj.filename = '';
		obj.url = '';
		obj.createDate = '';
		
		obj.set = function(path, filename, url, callback){
			obj.path = path;
			obj.filename = filename;
			obj.url = url;
			
			callback(obj);
		}
		
		return obj;
	}
	
	o.insertPhotoData = function(insertObj, callback){
		var status = new o.statusObj();
		
		var uuidBinary = new Buffer(uuid.v1({}, []));
        var id = mongodb.BSONPure.Binary(uuidBinary, mongodb.BSONPure.Binary.SUBTYPE_UUID);
		
		var ts = new Date().getTime();
        var i = ts % 1000;
        var t = new mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));
		
		insertObj._id = id;
		insertObj.createDate = t;
		
		db.collection('PhotoData', function(err, collection) {
			/* Insert a data */
			//console.log(insertObj);
			collection.insert(insertObj, function(err, data) {	
				//console.log(data);
				if (data) {										
					status.set(true, '', data, function(obj){
						callback(obj);
					});
				} else {
					status.set(false, 'Failed to inserted', data, function(obj){
						callback(obj);
					});
				}					
				//db.close();				
			});				
		});
	}
	
	o.getPhotoDataList = function(callback){
		var status = new o.statusObj();
		
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
				//db.close();
			});	
		});	}
	
	return o;
})( DALPhoto || {} );

module.exports = DALPhoto;