var
	async = require('async'),
	config = require('./config'),
	
	UtilObject = require('./UtilObject'),
	utilObj = new UtilObject(),
	
	DALMysqlProfile = require('./DALMysqlProfile'),
	dalProfile = new DALMysqlProfile(),

	ProfileData = require('./Models/ProfileData');
	

var ProfileFactory = function(){

}

ProfileFactory.prototype.register = function(req, res){
	var 
		name = req.body.name,
		email = req.body.email,
		pwHash = req.body.pwdHash;
		
	var userData = new ProfileData();
	
	async.waterfall([ 
	    function(callback) {
	    	userData.set(name, email, pwHash, function(userData){
	    		callback(null, userData);
	    	});
	    },
	    function(userData, callback) {
	    	dalProfile.insert(userData, callback);
	    }, 
	    function(msg, isGetData, data, callback) {
	    	var statusObj = new Status();
	    	statusObj.set(isGetData, msg, data, callback);
	    },
	    function(statusObj, callback) {
	    	utilObj.objResponse(res, statusObj);
	    	callback(null, 'done');
	    }], function(err, result) {
			if (err) {
				var obj = {
					err : err.toString(),
					result : result
				};
			utilObj.errResponse(res, obj);
		}
	});
}
	
ProfileFactory.prototype.getProfile = function(req, res){	
	var key = req.params.id;
	async.waterfall([	   
	    function(callback) {
	        dalProfile.getData(key, callback);
	    }, 
	    function(msg, isGetData, data, callback) {
	        var statusObj = new Status();
	        statusObj.set(isGetData, msg, data, callback);
	    },
	    function(statusObj, callback) {
	    	utilObj.objResponse(res, statusObj);
	       	callback(null, 'done');
	    }], function(err, result) {
	    	if (err) {
	    		var obj = {
	    				err : err.toString(),
	         			result : result
	         	};
	         	this.utilObj.errResponse(res, obj);
	        }
	});
}

module.exports = ProfileFactory;