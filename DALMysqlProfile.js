var DALMysqlProfile = (function(o){
	"use strict";
	
	var
		config,
		mysql,
		connection,
		tableName,
		uuid,
		utilObj;
		
	
	o.init = function(){
		initOnce();
		bindEvent();		
	}
	
	var initOnce = function(){		
		config = require('./config');
		mysql = require('mysql');
		connection = mysql.createConnection(config.MySqlConn);
		tableName = 'Profile';
		uuid = require('node-uuid');
		utilObj = require('./UtilObject');
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
	
	o.ProfileData = function(){
		var obj = {};		
		
		obj.name = '';
		obj.email = '';
		obj.password = '';
		obj.lastLoginDate = '';		
		
		obj.set = function(name, email, pwHash, callback){
			obj.strID = id;
			obj.path = path;
			obj.filename = filename;
			obj.url = url;
			
			callback(obj);
		}
		
		return obj;
	}
	
	o.insert = function(insertObj, callback){
		var status = new utilObj.statusObj();
		var sql = 'INSERT INTO `' + tableName + '` SET ?';
		//connection.connect();
		
		connection.query(sql, insertObj, function(error, res){
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
	
	o.remove = function(strID, callback){
		console.log("nothing");
	}
	
	o.update = function(strID, callback){
		console.log("nothing");			
	}
	
	o.getData = function(strID, callback){
		console.log("nothing");
	}
	
	o.getList = function(callback){
		console.log("nothing");
	}
	
	return o;
	
})( DALMysqlProfile || {} );

module.exports = DALMysqlProfile;