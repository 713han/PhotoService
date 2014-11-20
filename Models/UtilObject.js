var 
	Moment = require('moment'),
	Crypto = require('crypto'),
	Config = require(appRoot + '/config');

var log = function(msg){
	console.log('[' + new Date().toString() + '] ' + msg);
}

var UtilObject = function(){
	this.cacheTime = Config.cacheTime;
	this.debug = Config.debug;
}

UtilObject.prototype.getNowDateString = function(){
	return Moment().format('YYYY-MM-DD HH:mm:ss');
}

UtilObject.prototype.getSHA256Hash = function(string){
	var hash = Crypto.createHash('sha256').update(string).digest('base64');
	return hash;
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

UtilObject.prototype.errResponse = function(res, err){
	var errObj = {
		errcode : 500,
		errMsg : '500: Internal Server Error',
		debug : {}
	};
	
	if(this.debug){
		errObj.debug = err;
	}
	
	res.status(500);
	res.send(errObj);	
	res.end();	
}

module.exports = UtilObject;