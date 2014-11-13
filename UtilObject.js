var UtilObject = (function(o){
	"use strict";	
	
	var 
		config = require('./config'),
		cacheTime = config.cacheTime;
	
	var initOnce = function(){		
		
	}
	
	var bindEvent = function(){
		
	}	
	
	o.init = function(){
		initOnce();
		bindEvent();		
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
	
	o.sysInfoObj = function(){
		var obj = {};
		
		obj.pid;
		obj.workerID;
		obj.numReqs = 0;
		obj.cacheSize = 0;
		
		obj.addReqs = function (cacheSize){
			obj.numReqs++;
			obj.cacheSize = cacheSize;
		}		
		return obj;
	}
	
	o.log = function(msg){	
		console.log('[' + new Date().toString() + '] ' + msg);
	}
	
	o.error = function(res,callback) {
		return function( err, result ) {
			if( err ) {
				//errResponse(res,err);
				o.msgResponse(res, false, 'Internal Server Error');
				//objResponse(res, err);
			}
			else {
				callback(result);
			}
		}
	}
	
	o.imgResponse = function(res,buffer,contentType){		
		if (!res.getHeader('Cache-Control')){
			res.setHeader('Cache-Control', 'public, max-age=' + cacheTime);
		}		
		res.set('Content-Type', contentType);
		res.send(buffer);
	}

	o.msgResponse = function(res, status, msg){
		var msgObj = {
			status : status,
			msg : msg
		};
		res.send(msgObj);
	}

	o.objResponse = function(res, obj){
		res.send(obj);
	}

	o.errResponse = function(res,err){
		res.status(500);
		res.send('500: Internal Server Error');
		res.end(); 
		o.log(err);
	}
	
	return o;
	
})( UtilObject || {} );

module.exports = UtilObject;