var
	Async = require('async'),
	Config = require(appRoot + '/config'),	
	UtilObject = require(appRoot + '/Models/UtilObject'),
	Status = require(appRoot + '/Models/Status'),
	DALMysqlProfile = require(appRoot + '/Models/DALMysqlProfile'),
	ProfileData = require(appRoot + '/Models/ProfileData');

var
	utilObj = new UtilObject(),
	dalProfile = new DALMysqlProfile();

var ProfileFactory = function(){

}

/*
 * result:function(err, obj);
 */
ProfileFactory.prototype.register = function(name, email, pw, result){
	
	Async.waterfall([ 
	function(callback) {
		var userData = new ProfileData();
		userData.set(name, email, pw, callback);
	},
	function(userData, callback) {
		dalProfile.insert(userData, function(err, obj){
			if(err){
				callback(null, 'Insert Failed', false, err);
			}else{
				callback(null, '', true, obj);
			}
		});
	}, 
	function(msg, isGetData, data, callback) {
		var statusObj = new Status();
		statusObj.set(isGetData, msg, data, callback);
	},
	function(statusObj, callback) {
		result(null, statusObj);
		callback(null, 'done');
	}], function(err, resultObj) {
		if (err) {
			var obj = {
					err : err,
					result : resultObj
			};
			result(Obj, null);
		}
	});
}

/*
 * result:function(err, obj);
 */
ProfileFactory.prototype.getProfile = function(key, result){	
	
	Async.waterfall([	   
	function(callback) {
		dalProfile.getData(key, function(err, data){
			if(err){
				callback(null, 'Get data Failed', false, err);
			}else{
				if(data.length > 0){	    			
	    			callback(null, '', true, data);
	    		}else{
	    			callback(null, 'Data not found', false, data);
	    		}
			}
		});
	}, 
	function(msg, isGetData, data, callback) {
		var statusObj = new Status();
		statusObj.set(isGetData, msg, data, callback);
	},
	function(statusObj, callback) {
		result(null, statusObj);
		callback(null, 'done');
	}], function(err, resultObj) {
		if (err) {
			var obj = {
					err : err,
					result : resultObj
			};
			result(Obj, null);
		}
	});
}

module.exports = ProfileFactory;