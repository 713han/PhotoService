var config = require('./config');

var log = function(msg){
	console.log('[' + new Date().toString() + '] ' + msg);
}

var UtilObject = function(){
	this.cacheTime = config.cacheTime;
	this.debug = config.debug;
}

UtilObject.prototype.log = function(msg){
	log(msg);
}

UtilObject.prototype.imgResponse = function(res,buffer,contentType){		
	if (!res.getHeader('Cache-Control')){
		res.setHeader('Cache-Control', 'public, max-age=' + this.cacheTime);
	}		
	res.set('Content-Type', contentType);
	res.send(buffer);
}

UtilObject.prototype.msgResponse = function(res, status, msg){
	var msgObj = {
		status : status,
		msg : msg
	};
	res.send(msgObj);
}

UtilObject.prototype.objResponse = function(res, obj){
	res.send(obj);
}

UtilObject.prototype.errResponse = function(res, errMsg){
	var errObj = {
		errcode : 500,
		errMsg : '500: Internal Server Error',
		debug : {}
	};
	
	if(this.debug){
		errObj.debug = errMsg;
	}
	
	res.status(500);
	res.send(errObj);	
	res.end();	
}

module.exports = UtilObject;