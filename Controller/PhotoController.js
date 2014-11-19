var 
	Async = require('async'),
	UUID = require('node-uuid'),
	Config = require(appRoot + '/config'),
	PhotoFactory = require(appRoot + '/Models/PhotoFactory'),
	UtilObject = require(appRoot + '/Models/UtilObject');

var 
	photoObj = new PhotoFactory(),
	utilObj = new UtilObject(),	
	imgHome = Config.imgHome,
	ipLimit = Config.ipLimit,
	uploadSize = Config.uploadSize;

var PhotoController = function(){
	
}

PhotoController.prototype.getPhoto = function(req, res){
	var key = req.params.strID;
	photoObj.getPhoto(key, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
};

PhotoController.prototype.updatePhoto = function(req, res){	
	var key = req.params.strID;
	photoObj.updatePhoto(key, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
};

PhotoController.prototype.removePhoto = function(req, res){	
	var key = req.params.strID;
	photoObj.removePhoto(key, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});	
};

PhotoController.prototype.getPhotoList = function(req, res){
	photoObj.getPhotoList(function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
};

PhotoController.prototype.getImg = function (req, res, next) {	
	var
		width = req.params.width,
		height = req.params.height,
		strPath = req.params.path;
		
	photoObj.getImg(width, height, strPath, function(err, obj){
		if(err){			
			utilObj.errResponse(res, err);
		}else{			
			utilObj.imgResponse(res, obj.buffer, obj.contentType);
		}
	});
};

PhotoController.prototype.imgUpload = function(req, res) {	
	try{
		var ip = req.headers['x-real-ip'] || 
				 req.connection.remoteAddress ;

		var strID = UUID.v1(),
			fileName = strID,
			fileHome = imgHome,
			fromPath = imgHome + 'temp/',
			toPath = 'temp/Upload/',
			fstream;
		
		Async.waterfall([
		function(callback) {
			if(ipLimit[ip]){
				callback(null);
			}else{				
				callback('Access Denied', 'PhotoController.imgUpload:ipLimit');
			}
		},
		function(callback){
			if(req.headers['content-length'] <= uploadSize){
				req.pipe(req.busboy);
				req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
					if(fieldname == 'filePath'){
						if(val!=''){
							toPath = 'photo/' + val;
						}
					}					
					if(fieldname == 'fileName'){
						if(val != ''){
							fileName = val;
						}
					}
				});
				req.busboy.on('file', function (fieldname, file, name, encoding, mimetype) {					
					callback(null, mimetype, file);
				});
			}else{				
				callback('File is too large', 'PhotoController.imgUpload:content-length');
			}
		},
		function(mimetype, file, callback){
			photoObj.imgUpload(strID, mimetype, file, fileName, fileHome, fromPath, toPath, function(err, obj){
				if(err){
					callback(err, 'PhotoController.imgUpload:photoObj.imgUpload');
				}else{
					utilObj.objResponse(res, obj)
					callback(null, 'Done');
				}
			});
		}], function(err, result){
			if (err) {
				var obj = {
					err : err,
					result : result
				};
				utilObj.errResponse(res, obj.toString());
			}
		});		
	}catch(e){
		utilObj.errResponse(res,e.toString());
	}
};

module.exports = PhotoController;