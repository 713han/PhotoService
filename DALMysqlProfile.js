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
	
	o.ProfileData = function(){
		var obj = {};		
		
		obj.name = '';
		obj.email = '';
		obj.password = '';
		obj.ProfilePhoto = '';
		obj.lastLoginDate = '';		
		
		obj.set = function(name, email, pwHash, callback){
			var t = new Date();
			obj.name = name;
			obj.email = email;
			obj.password = pwHash;
			obj.lastLoginDate = t.toISOString();
			
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
		        //throw error;
		    }
		    status.set(true, '', insertObj, function(obj){
				callback(obj);
			});		    
		});
		
		//connection.end();
	}
	
	o.remove = function(id, callback){
		console.log("nothing");
	}
	
	o.update = function(strID, callback){
		console.log("nothing");			
	}
	
	o.getData = function(id, callback){		
		var status = new utilObj.statusObj();
		var sql = 'SELECT * FROM `' + tableName + '` WHERE id = ?';
		
		//connection.connect();
		connection.query(sql, id, function(error, data, fields){
		    if(error){ throw error; }
		    if (data) {									
				status.set(true, '', data, function(obj){
					callback(obj);
				});
			} else {
				status.set(false, 'Cannot found', data, function(obj){
					callback(obj);
				});
			}
		});		
		
		//connection.end();
	}
	
	o.getList = function(callback){
		console.log("nothing");
	}
	
	return o;
	
})( DALMysqlProfile || {} );

module.exports = DALMysqlProfile;