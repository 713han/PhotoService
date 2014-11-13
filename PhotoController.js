var PhotoController = (function(o){
	"use strict";
	
	var
		fs = require('fs'),
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
		
		utilObj = require('./UtilObject'),
		dalPhoto = require('./DALMongodbPhoto');				
		dalPhoto.init();
	
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
	
	o.init = function(){
		initOnce();
		bindEvent();		
	}
	
	o.getPhoto = function(req, res){	
		var key = req.params.strID;
		dalPhoto.getPhotoData(key, function(statusObj){
			utilObj.objResponse(res, statusObj);
		});		
	}
	
	o.savePhoto = function(req, res){	
		var key = req.params.strID;
		dalPhoto.savePhotoData(key, function(statusObj){
			utilObj.objResponse(res, statusObj);
		});		
	}
	
	o.updatePhoto = function(req, res){	
		var key = req.params.strID;
		dalPhoto.updatePhotoData(key, function(statusObj){
			utilObj.objResponse(res, statusObj);
		});		
	}
	
	o.removePhoto = function(req, res){	
		var key = req.params.strID;
		dalPhoto.removePhotoData(key, function(statusObj){
			utilObj.objResponse(res, statusObj);
		});		
	}
	
	o.getPhotoList = function(req, res){		
		dalPhoto.getPhotoDataList(function(statusObj){
			utilObj.objResponse(res, statusObj);
		});		
	}
	
	o.getImg = function (req, res, next) {
		try{
			var key = req.params.width + req.params.height + req.params.path;
			var path = imgHome;
			var imgPath = path + 'photo/' + req.params.path.replace(/\'/g,"/");
			var ext = getExtension(imgPath);
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
				obj = new imgObj();
				if(config.isUseCache){
					cache.set(key, obj);	
				}
				gm(imgPath)
					.resize(req.params.width, req.params.height)
					.toBuffer(utilObj.error(res,function (buffer) {						
						obj.setImage(buffer, ext);
						utilObj.imgResponse(res,obj.buffer,obj.contentType);
					}));		
			}else{
				useCache();
			}
			
			
		}catch(e){
			utilObj.errResponse(res,e);
		}
		process.send({cmd : 'addReq', pid : process.pid, cacheSize : cache.keys().length});
	}
	
	o.imgUpload = function(req, res) {
		try{		
			var ip = req.headers['x-real-ip'] || 
					 req.connection.remoteAddress ;
					 
			var fstream,
				typeMap = {
					'image/x-ms-bmp' : true,
					'image/gif' : true,
					'image/png' : true,
					'image/jpeg' : true
				},
				nameMap = {
					'image/bmp' : '.bmp',
					'image/gif' : '.gif',
					'image/png' : '.png',
					'image/jpeg' : '.jpg'
				};
			
			var fromPath = imgHome + 'temp/',
				toPath = 'temp/Upload/',
				strID = uuid.v1(),
				fileName = strID;
			
			if(ipLimit[ip]){			
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
						/*
						var len = 0;
						file.on('data', function(data) {
							len += data.length;
						});
						file.on('end', function() {
							console.log('File Finished, Length:' + len);
						});
						*/
						fileName += nameMap[mimetype];
						
						fstream = fs.createWriteStream(fromPath + fileName);
						file.pipe(fstream);
						fstream.on('close', function () {
							var magic = new Magic(mmm.MAGIC_MIME_TYPE);
							magic.detectFile(fromPath + fileName, utilObj.error(res,function(result) {							
								if(typeMap[result] == true){									
									fs.mkdirParent(imgHome + toPath ,'0755', function(){
										fs.rename(fromPath + fileName, imgHome + toPath + fileName, utilObj.error(res,function (result) {
											var PhotoData = dalPhoto.PhotoData();
											var writeExifObj = {};
											new exifImage({ image : imgHome + toPath + fileName }, function (error, exifData) {											    	
												if (error){
													writeExifObj = error;
												}else{
													writeExifObj = exifData;
												}	
												PhotoData.set(strID, toPath, fileName, hostname + toPath + fileName, writeExifObj, function(insertObj){
													dalPhoto.insertPhotoData(insertObj, function(statusObj){
														utilObj.objResponse(res, statusObj);
													});
												});										            
											});
										}));
									});
								}else{					
									fs.unlink(fromPath + fileName, 
										utilObj.error(res,function(result){
											utilObj.msgResponse(res, false, 'Incorrect Format.');
									}));
								}
							}));				
						});
					});
				}else{
					utilObj.msgResponse(res, false, 'File is too large');
				}
			}else{
				utilObj.msgResponse(res, false, 'Access Denied');
			}		
		}catch(e){
			utilObj.errResponse(res,e);
		}
	}	
			
	var imgObj = function(){			
		var obj = {},
			contentTypeArray = {
				'.jpg': 'image/jpeg',
				'.jpeg': 'image/jpeg',
				'.gif': 'image/gif',
				'.png': 'image/png',
				'.bmp': 'image/bmp'
			};
		
		obj.buffer = 0;
		obj.isReady = false;
		obj.ext = '';
		obj.contentType = '';
		
		obj.setImage = function(data, extname){
			obj.buffer = data;		
			obj.ext = extname;
			obj.contentType = contentTypeArray[extname];
			obj.isReady = true;
		}
		return obj;
	}
	
	var getExtension = function(filename) {
		var i = filename.lastIndexOf('.');
		return (i < 0) ? '' : filename.substr(i).toLowerCase();
	}
	
	var bindEvent = function(){
		
	}

	var initOnce = function(){
		
	}

	return o;
})( PhotoController || {} );

module.exports = PhotoController;