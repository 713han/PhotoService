var photoController = (function(o){
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
	
		//express config
		cacheTime = config.cacheTime,
	
		//lru-cache config	
		cache = lruCache(config.lruOptions),
		//otherCache = lruCache(50); // sets just the max size;
		
		dalPhoto = require('./DALMongodbPhoto');
		//dalPhoto = require('./DALMysqlPhoto');		
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
			objResponse(res, statusObj);
		});		
	}
	
	o.savePhoto = function(req, res){	
		var key = req.params.strID;
		dalPhoto.savePhotoData(key, function(statusObj){
			objResponse(res, statusObj);
		});		
	}
	
	o.updatePhoto = function(req, res){	
		var key = req.params.strID;
		dalPhoto.updatePhotoData(key, function(statusObj){
			objResponse(res, statusObj);
		});		
	}
	
	o.removePhoto = function(req, res){	
		var key = req.params.strID;
		dalPhoto.removePhotoData(key, function(statusObj){
			objResponse(res, statusObj);
		});		
	}
	
	o.getPhotoList = function(req, res){		
		dalPhoto.getPhotoDataList(function(statusObj){
			objResponse(res, statusObj);
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
						imgResponse(res,obj.buffer,obj.contentType);
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
					.toBuffer(error(res,function (buffer) {						
						obj.setImage(buffer, ext);
						imgResponse(res,obj.buffer,obj.contentType);
					}));		
			}else{
				useCache();
			}
			
			
		}catch(e){
			errResponse(res,e);
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
							magic.detectFile(fromPath + fileName, error(res,function(result) {							
								if(typeMap[result] == true){									
									fs.mkdirParent(imgHome + toPath ,'0755', function(){
										fs.rename(fromPath + fileName, imgHome + toPath + fileName, error(res,function (result) {
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
														objResponse(res, statusObj);
													});
												});										            
											});
										}));
									});
								}else{					
									fs.unlink(fromPath + fileName, 
										error(res,function(result){
											msgResponse(res, false, 'Incorrect Format.');
									}));
								}
							}));				
						});
					});
				}else{
					msgResponse(res, false, 'File is too large');
				}
			}else{
				msgResponse(res, false, 'Access Denied');
			}		
		}catch(e){
			errResponse(res,e);
		}
	}
	
	o.log = function(msg){	
		log(msg);
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

	/*	
	var replacePath = function (path){
		var newPath = 'photo/' + path;
		return newPath;
	}
	*/
	

	var log = function(msg){	
		console.log('[' + new Date().toString() + '] ' + msg);
	}

	var error = function(res,callback) {
		return function( err, result ) {
			if( err ) {
				//errResponse(res,err);
				msgResponse(res, false, 'Internal Server Error');
				//objResponse(res, err);
			}
			else {
				callback(result);
			}
		}
	}
	
	var imgResponse = function(res,buffer,contentType){		
		if (!res.getHeader('Cache-Control')){
			res.setHeader('Cache-Control', 'public, max-age=' + cacheTime);
		}		
		res.set('Content-Type', contentType);
		res.send(buffer);
	}

	var msgResponse = function(res, status, msg){
		var msgObj = {
			status : status,
			msg : msg
		};
		res.send(msgObj);
	}

	var objResponse = function(res, obj){
		res.send(obj);
	}

	var errResponse = function(res,err){
		res.status(500);
		res.send('500: Internal Server Error');
		res.end(); 
		log(err);
	}

	var bindEvent = function(){
		
	}

	var initOnce = function(){
		
	}

	return o;
})( photoController || {} );

module.exports = photoController;