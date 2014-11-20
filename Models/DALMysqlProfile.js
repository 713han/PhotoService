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
	var sql = 'DELETE FROM `' + this.tableName + '` WHERE id = ?';
	var defErrMsg = 'Failed to removed';
	executeSQL(sql, id, defErrMsg, result);	
}

/*
 * result:function(err, obj);
 */
DALMysqlProfile.prototype.update = function(id, data, result){
	var sql = 'UPDATE `' + this.tableName + '` SET ? WHERE id = ?';
	var defErrMsg = 'Failed to updated';
	executeSQL(sql, [data, id], defErrMsg, result);			
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
DALMysqlProfile.prototype.getDataByMail = function(email, result){		
	var sql = 'SELECT * FROM `' + this.tableName + '` WHERE Email = ?';
	var defErrMsg = 'Cannot found';
	executeSQL(sql, email, defErrMsg, result);		
}

/*
 * result:function(err, obj);
 */
DALMysqlProfile.prototype.getList = function(result){
	var sql = 'SELECT * FROM `' + this.tableName + '` ';
	var defErrMsg = 'Cannot found';
	executeSQL(sql, null, defErrMsg, result);	
}

module.exports = DALMysqlProfile;