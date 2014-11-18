var	
	mysql = require('mysql'),
	config = require('./config'),
	connection = mysql.createConnection(config.MySqlConn);

var executeSQL = function(strSQL, data, defErrMsg, callback){
	//connection.connect();		
	connection.query(strSQL, data, function(error, resData){
		if (error) {										
			callback(null, defErrMsg, false, resData);
		} else {				
			callback(null, '', true, resData);
		}
	});		
	//connection.end();
}

var DALMysqlProfile = function(){
	this.tableName = 'Profile';		
}
	
DALMysqlProfile.prototype.insert = function(insertObj, callback){	
	var sql = 'INSERT INTO `' + this.tableName + '` SET ?';
	var defErrMsg = 'Failed to inserted';
	executeSQL(sql, insertObj, defErrMsg, callback);
}
	
DALMysqlProfile.prototype.remove = function(id, callback){
	//TODO remove
	console.log("nothing");
}
	
DALMysqlProfile.prototype.update = function(strID, callback){
	//TODO update
	console.log("nothing");			
}
	
DALMysqlProfile.prototype.getData = function(id, callback){		
	var sql = 'SELECT * FROM `' + this.tableName + '` WHERE id = ?';
	var defErrMsg = 'Cannot found';
	executeSQL(sql, id, defErrMsg, callback);		
}
	
DALMysqlProfile.prototype.getList = function(callback){
	//TODO getList
	console.log("nothing");
}

module.exports = DALMysqlProfile;