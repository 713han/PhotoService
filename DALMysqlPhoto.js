var DALMysqlPhoto = (function(o){
	"use strict";
	
	var
		mysql,
		connection,
		uuid;
		
	
	o.init = function(){
		initOnce();
		bindEvent();		
	}
	
	var initOnce = function(){		
		mysql = require('mysql');
		connection = mysql.createConnection({
		    host: '127.0.0.1',
		    user: 'hanshuang',
		    password: 'yam317047',
		    database: 'hanshuang'
		});
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
		
		//obj._id = 0;
		obj.strID = '';
		obj.path = '';
		obj.filename = '';
		obj.url = '';
		//obj.createDate = '';
		
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
		//connection.connect();
		
		connection.query('INSERT INTO `PhotoData` SET ?', insertObj, function(error, res){
		    if(error){
		    	status.set(false, 'Failed to inserted', insertObj, function(obj){
					callback(obj);
				});
		        throw error;
		    }
		    status.set(true, '', insertObj, function(obj){
				callback(obj);
			});
		    console.log(res);
		});
		
		//connection.end();
	}
	
	o.removePhotoData = function(strID, callback){
		console.log("nothing");
	}
	

	o.savePhotoData = function(strID, callback){
		console.log("nothing");
	}
	
	o.updatePhotoData = function(strID, callback){
		console.log("nothing");			
	}
	
	o.getPhotoData = function(strID, callback){
		console.log("nothing");
	}
	
	o.getPhotoDataList = function(callback){
		console.log("nothing");
	}
	
	return o;
	
})( DALMysqlPhoto || {} );

module.exports = DALMysqlPhoto;