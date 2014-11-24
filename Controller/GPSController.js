var 
	GPSFactory = require(appRoot + '/Models/GPSFactory'),
	UtilObject = require(appRoot + '/Models/UtilObject');

var 
	gpsObj = new GPSFactory(),
	utilObj = new UtilObject();

var GPSController = function(){
	
}

GPSController.prototype.getGPSList = function(req, res){
	
	gpsObj.getGPSList(function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
}

GPSController.prototype.getGPSData = function(req, res){
	var key = req.params.id.input;
	/*
	console.log(req.params.id[0]);
	console.log(req.params.id.index);
	console.log(req.params.id.input);
	*/
	gpsObj.getGPSData(key, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
}

GPSController.prototype.gpsLogUpload = function(req, res){
	var gpsLogObj = req.body;
	
	gpsObj.gpsLogUpload(gpsLogObj, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
}

module.exports = GPSController;