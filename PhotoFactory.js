var
	async = require('async'),
	fs = require('fs'),
	path = require('path'),
	gm = require('gm'),
	lruCache = require('lru-cache'),
	mmm = require('mmmagic'),
	Magic = mmm.Magic,
	uuid = require('node-uuid'),
	exifImage = require('exif').ExifImage,	
	
	config = require('./config'),		
	hostname = config.hostname,
	imgHome = config.imgHome,
	ipLimit = config.ipLimit,
	uploadSize = config.uploadSize,
		
	//lru-cache config	
	cache = lruCache(config.lruOptions),
	
	PhotoData = require('./Models/PhotoData'),
	Status = require('./Models/Status'),
	ImgCache = require('./Models/ImgCache'),	
		
	UtilObject = require('./UtilObject'),
	utilObj = new UtilObject(),
	
	DALMongodbPhoto = require('./DALMongodbPhoto'),
	dalPhoto = new DALMongodbPhoto();

	fs.mkdirParent = function(dirPath, mode, callback) {
		//Call the standard fs.mkdir
		fs.mkdir(dirPath, mode, function(error) {
		//When it fail in this way, do the custom steps
			if (error && error.errno === 34) {
				//Create all the parents recursively			
				fs.mkdirParent(path.dirname(dirPath), mode, function(){});
				//And then the directory			
				fs.mkdirParent(dirPath, mode, function(){});
			}
			//Manually run the callback since we used our own callback to do all these
			callback && callback(error);
		});
	};
	
var getExtension = function(filename) {
	var i = filename.lastIndexOf('.');
	return (i < 0) ? '' : filename.substr(i).toLowerCase();
};

var PhotoFactory = function(){
	this.typeMap = {
			'image/x-ms-bmp' : true,
			'image/gif' : true,
			'image/png' : true,
			'image/jpeg' : true
	};
	
	this.nameMap = {
			'image/bmp' : '.bmp',
			'image/gif' : '.gif',
			'image/png' : '.png',
			'image/jpeg' : '.jpg'
	};
	
	this.ImgFileHome = imgHome;
	this.getImgPath = this.ImgFileHome + 'photo/';
	this.fromPath = imgHome + 'temp/';
	this.toPath = 'temp/Upload/';
}

PhotoFactory.prototype.getPhoto = function(req, res){
	var statusObj = new Status();
	async.waterfall([ 
	    function(callback) {
	    	var key = req.params.strID;
	    	dalPhoto.getPhotoData(key, callback);
	    }, 
	    function(msg, isGetData, data, callback) {
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
};

PhotoFactory.prototype.updatePhoto = function(req, res){
	var statusObj = new Status();
	async.waterfall([ 
	    function(callback) {
	    	var key = req.params.strID;
	    	dalPhoto.updatePhotoData(key, callback);
	    }, 
	    function(msg, isGetData, data, callback) {
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
};

PhotoFactory.prototype.removePhoto = function(req, res){
	var statusObj = new Status();
	async.waterfall([ 
	    function(callback) {
	    	var key = req.params.strID;
	    	dalPhoto.removePhotoData(key, callback);
	    }, 
	    function(msg, isGetData, data, callback) {
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
	// TODO 實體檔案刪除
};

PhotoFactory.prototype.getPhotoList = function(req, res){
	var statusObj = new Status();
	async.waterfall([
	    function(callback) { 
	    	dalPhoto.getPhotoDataList(callback);
	    },
	    function(msg, isGetData, data, callback) { 
	    	statusObj.set(isGetData, msg, data, callback);
	    },
	    function(statusObj, callback) { 
	    	utilObj.objResponse(res, statusObj);
	    	callback(null, 'done');
	    }
	], function (err, result) {		
		if(err){
			var obj = {
				err : err.toString(),
				result : result
			};
			utilObj.errResponse(res, obj);
		}
	});
};

PhotoFactory.prototype.getImg = function (req, res, next) {
	try{		
		var path = this.getImgPath + req.params.path.replace(/\'/g,"/");
		var key = req.params.width + req.params.height + req.params.path;		
		var ext = getExtension(path);
		var obj;		
		
		var useCache = function(){
			var show = false;
			if(!show){		
				if(obj.isReady == true){
					utilObj.imgResponse(res,obj.buffer,obj.contentType);
					show = true;
				}else{
					//process.nextTick(useCache); //(node) warning: Recursive process.nextTick detected. This will break in the next version of node. Please use setImmediate for recursive deferral.
					setImmediate(useCache);
				}				
			}
		}
		
		if(config.isUseCache){
			obj  = cache.get(key);
		}
		
		if(typeof obj === 'undefined'){				
			obj = new ImgCache();
			if(config.isUseCache){
				cache.set(key, obj);	
			}
			
			gm(path)
				.resize(req.params.width, req.params.height)
				.toBuffer(function (err, buffer) {
					obj.setImage(buffer, ext);					
					utilObj.imgResponse(res,obj.buffer,obj.contentType);					
				});			
		}else{			
			useCache();
		}		
	}catch(e){
		utilObj.errResponse(res,e.toString());
	}	

	process.send({cmd : 'addReq', pid : process.pid, cacheSize : cache.keys().length});	
};

PhotoFactory.prototype.imgUpload = function(req, res) {
	try{
		var ip = req.headers['x-real-ip'] || 
				 req.connection.remoteAddress ;

		var strID = uuid.v1(),
			fileName = strID,
			fileHome = this.ImgFileHome,
			fileFromPath = this.fromPath,
			fileToPath = this.toPath,
			nameMap = this.nameMap,
			typeMap = this.typeMap,
			fstream;
		
		if(ipLimit[ip]){			
			if(req.headers['content-length'] <= uploadSize){
				req.pipe(req.busboy);
				req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
					if(fieldname == 'filePath'){
						if(val!=''){
							fileToPath = 'photo/' + val;
						}
					}
					
					if(fieldname == 'fileName'){
						if(val != ''){
							fileName = val;
						}
					}
				});
				req.busboy.on('file', function (fieldname, file, name, encoding, mimetype) {				
					async.waterfall([
					    function(callback) {
					    	fileName += nameMap[mimetype];					
							fstream = fs.createWriteStream(fileFromPath + fileName);
							file.pipe(fstream);
							fstream.on('close',function(){
								callback(null);
							});
					    },
					    function(callback) { 
					    	var magic = new Magic(mmm.MAGIC_MIME_TYPE);
							magic.detectFile(fileFromPath + fileName, function(err, result){
								if(err){
									callback('Get file type failed.','PhotoFactory.imgUpload:mkdirParent');
								}else{									
									callback(null, result);
								}
							});
					    },
					    function(result, callback) { 					    	
					    	if(typeMap[result] == true){									
								fs.mkdirParent(fileHome + fileToPath ,'0755', function(err){
									if(err){
										//nothing
										//callback('Created parent directory failed.:' + err.toString(),'PhotoFactory.imgUpload:mkdirParent');
									}
									callback(null);
								});
							}else{					
								fs.unlink(fileFromPath + fileName, function(err){
									if(err){
										callback('Incorrect Format, file delete failed.','PhotoFactory.imgUpload:unlink');
									}else{
										callback('Incorrect Format.','PhotoFactory.imgUpload:unlink');
									}
								});								
							}
					    },
					    function(callback) { 
					    	fs.rename(fileFromPath + fileName, fileHome + fileToPath + fileName, function(err){
					    		if(err){
									callback('file rename failed.','PhotoFactory.imgUpload:rename');
								}else{
									callback(null);
								}					    		
					    	});
					    },
					    function(callback){					    								
							new exifImage({ image : fileHome + fileToPath + fileName }, function (error, exifData) {											    	
								if (error){									
									callback(null, error);
								}else{
									callback(null, exifData);
								}
							});
					    },
					    function(exifData, callback){
					    	var dataObj = new PhotoData();
					    	dataObj.set(strID, 
					    				fileToPath, 
					    				fileName, 
					    				hostname + fileToPath + fileName, 
					    				exifData, 
					    				function(obj){
					    		callback(null, obj);
					    	});
					    },
					    function(obj, callback){
					    	dalPhoto.insertPhotoData(obj, callback);
					    },
					    function(msg, isGetData, data, callback) {
					    	var statusObj = new Status();
					    	statusObj.set(isGetData, msg, data, callback);
					    },
					    function(statusObj, callback) {
					    	utilObj.objResponse(res, statusObj);
					    	callback(null, 'done');
					    }], function (err, result) {
					        if(err){
					        	var obj = {
					         		err : err.toString(),
					         		result : result
					         	};
					         	utilObj.errResponse(res, obj);
					        }
						});
				});
			}else{
				utilObj.msgResponse(res, false, 'File is too large');
			}
		}else{
			utilObj.msgResponse(res, false, 'Access Denied');
		}		
	}catch(e){
		utilObj.errResponse(res,e.toString());
	}
};

module.exports = PhotoFactory;