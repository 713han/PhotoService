var
	Async = require('async'),
	Config = require(appRoot + '/config'),	
	UtilObject = require(appRoot + '/Models/UtilObject'),
	Status = require(appRoot + '/Models/DataObject/Status'),	
	ProfileData = require(appRoot + '/Models/DataObject/ProfileData'),
	DALMysqlProfile = require(appRoot + '/Models/DAL/DALMysqlProfile');

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
		dalProfile.getDataByMail(userData.email, function(err, obj){
			if(err){
				callback(null, 'Check User Failed', false, err);
			}else{				
				if(obj.length > 0){					
					callback(null, 'User already exists');
				}else{
					callback(null, userData);
				}				
			}
		});
	}, 
	function(userData, callback) {
		if(userData instanceof ProfileData){
			dalProfile.insert(userData, function(err, obj){
				if(err){
					callback(null, 'Insert Failed', false, err);
				}else{
					callback(null, '', true, obj);
				}
			});
		}else{
			callback(null, userData, false, null);
		}
	}, 
	function(msg, flag, data, callback) {
		var statusObj = new Status();
		statusObj.set(flag, msg, data, callback);
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
			result(obj, null);
		}
	});
}

/*
 * result:function(err, obj);
 */
ProfileFactory.prototype.verify = function(email, pw, result){	
	Async.waterfall([	   
	function(callback) {
		dalProfile.getDataByMail(email, function(err, data){
			if(err){
				callback(null, 'Get data Failed');
			}else{
				if(data.length > 0){	
					var pwHash = utilObj.getSHA256Hash(pw);
					if(pwHash == data[0].Password){
						callback(null, data[0]);
					}else{
						callback(null, 'Access denied');
					}
	    		}else{
	    			callback(null, 'User not found');
	    		}
			}
		});
	},
	function(user, callback) {		
		if(typeof user === 'string'){
			callback(null, user, false, null);
		}else{
			var updObj = {
				LastLoginDate : utilObj.getNowDateString()
			}
			dalProfile.update(user.ID, updObj, function(err, data){
				var obj = {
					ID: user.ID,
					Info : data
				}
				callback(null, '', true, obj);						
			});
		}
	},
	function(msg, flag, data, callback) {
		var statusObj = new Status();
		statusObj.set(flag, msg, data, callback);
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
			result(obj, null);
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
	function(msg, flag, data, callback) {
		var statusObj = new Status();
		statusObj.set(flag, msg, data, callback);
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
			result(obj, null);
		}
	});
}

/*
 * result:function(err, obj);
 */
ProfileFactory.prototype.getProfileList = function(page, itemPerPage, result){	
	
	Async.waterfall([	   
	function(callback) {
		dalProfile.getList(page, itemPerPage, function(err, data){
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
	function(msg, flag, data, callback) {
		var statusObj = new Status();
		statusObj.set(flag, msg, data, callback);
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
			result(obj, null);
		}
	});
}

/*
 * result:function(err, obj);
 */
ProfileFactory.prototype.remove = function(key, result){	
	Async.waterfall([ 	
	function(callback) {
		dalProfile.remove(key, function(err, obj){
			if(err){
				callback(null, 'Remove Failed', false, err);
			}else{				
				callback(null, '', true, obj);				
			}
		});
	}, 
	function(msg, flag, data, callback) {
		var statusObj = new Status();
		statusObj.set(flag, msg, data, callback);
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
			result(obj, null);
		}
	});
}

module.exports = ProfileFactory;