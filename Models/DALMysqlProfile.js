var	
	Mysql = require('mysql'),
	Config = require(appRoot + '/config');	

/*
 * result:function(err, obj);
 */
var executeSQL = function(strSQL, data, defErrMsg, result){
	connection = Mysql.createConnection(Config.MySqlConn);
	//connection.connect();		
	connection.query(strSQL, data, function(error, resData){
		if (error) {										
			result(error, defErrMsg);
		} else {				
			result(null, resData);
		}
	});		
	//connection.end();
}

var DALMysqlProfile = function(){
	this.tableName = 'Profile';		
}

/*
 * result:function(err, obj);
 */
DALMysqlProfile.prototype.insert = function(insertObj, result){	
	var sql = 'INSERT INTO `' + this.tableName + '` SET ?';
	var defErrMsg = 'Failed to inserted';
	executeSQL(sql, insertObj, defErrMsg, result);
}

/*
 * result:function(err, obj);
 */
DALMysqlProfile.prototype.remove = function(id, result){
	//TODO remove
	console.log("nothing");
}

/*
 * result:function(err, obj);
 */
DALMysqlProfile.prototype.update = function(strID, result){
	//TODO update
	console.log("nothing");			
}

/*
 * result:function(err, obj);
 */
DALMysqlProfile.prototype.getData = function(id, result){		
	var sql = 'SELECT * FROM `' + this.tableName + '` WHERE id = ?';
	var defErrMsg = 'Cannot found';
	executeSQL(sql, id, defErrMsg, result);		
}

/*
 * result:function(err, obj);
 */
DALMysqlProfile.prototype.getList = function(result){
	//TODO getList
	console.log("nothing");
}

module.exports = DALMysqlProfile;