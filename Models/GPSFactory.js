var
	Async = require('async'),
	Config = require(appRoot + '/config'),
	Status = require(appRoot + '/Models/DataObject/Status'),
	DALMongodbGPS = require(appRoot + '/Models/DAL/DALMongodbGPS');	

var	
	dalGPS = new DALMongodbGPS();

var GPSFactory = function(){
	
}

/*
 * result:function(err, obj);
 */
GPSFactory.prototype.getGPSData = function(key, result){
	Async.waterfall([ 
	function(callback) {
		dalGPS.get(key, function(err, data){
			if(err){
				callback(null, 'Get GPS data failed', false, err);
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
    	callback(null, 'Done');
    }], function(err, result) {
			if (err) {
				var obj = {
					err : err,
					result : result
				};
				result(obj, null);
			}
	});
};

/*
 * result:function(err, obj);
 */
GPSFactory.prototype.getGPSList = function(result){
	Async.waterfall([ 
	function(callback) {
		dalGPS.getList(function(err, data){
			if(err){
				callback(null, 'Get GPS data list failed', false, err);
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
    	callback(null, 'Done');
    }], function(err, result) {
			if (err) {
				var obj = {
					err : err,
					result : result
				};
				result(obj, null);
			}
	});
};

/*
 * result:function(err, obj);
 */
GPSFactory.prototype.gpsLogUpload = function(gpsLogObj, result) {
	var nameMap = this.nameMap;
	var typeMap = this.typeMap;
	
	Async.waterfall([
	function(callback) {
		dalGPS.insert(gpsLogObj, function(err, data) {
			if (err) {
				callback(null, 'Insert GPS data failed', false, err);
			} else {
				callback(null, '', true, data);
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
	}], function(err, result) {
		if (err) {
			var obj = {
				err : err,
				result : result
			};
			result(obj, null);
		}
	});	
};

module.exports = GPSFactory;