var
	Async = require('async'),
	Fs = require('fs'),
	Path = require('path'),
	Gm = require('gm'),
	LruCache = require('lru-cache'),
	MMMagic = require('mmmagic'),
	Magic = MMMagic.Magic,	
	ExifImage = require('exif').ExifImage,	
	Config = require(appRoot + '/config'),
	PhotoData = require(appRoot + '/Models/DataObject/PhotoData'),
	Status = require(appRoot + '/Models/DataObject/Status'),
	ImgCache = require(appRoot + '/Models/DataObject/ImgCache'),
	DALMongodbPhoto = require(appRoot + '/Models/DAL/DALMongodbPhoto');	

var	
	cache = LruCache(Config.lruOptions),
	hostname = Config.hostname,
	imgHome = Config.imgHome,
	dalPhoto = new DALMongodbPhoto();

Fs.mkdirParent = function(dirPath, mode, callback) {
	//Call the standard fs.mkdir
	Fs.mkdir(dirPath, mode, function(error) {
	//When it fail in this way, do the custom steps
		if (error && error.errno === 34) {
			//Create all the parents recursively			
			Fs.mkdirParent(Path.dirname(dirPath), mode, function(){});
			//And then the directory			
			Fs.mkdirParent(dirPath, mode, function(){});
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
	
	this.getImgPath = imgHome + 'photo/';
}

/*
 * result:function(err, obj);
 */
PhotoFactory.prototype.getPhoto = function(key, result){
	Async.waterfall([ 
	function(callback) {
		dalPhoto.getPhotoData(key, function(err, data){
			if(err){
				callback(null, 'Get photo data failed', false, err);
	    	}else{
	    		if(data.length > 0){	    			
	    			callback(null, '', true, data);
	    		}else{
	    			callback(null, 'Data not found', false, data);
	    		}
	    	}
	    });
    }, 
    function(msg, isGetData, data, callback) {
    	var statusObj = new Status();
    	statusObj.set(isGetData, msg, data, callback);
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
PhotoFactory.prototype.updatePhoto = function(key, result){
	Async.waterfall([ 
	function(callback) {
		dalPhoto.updatePhotoData(key, function(err, data){
			if(err){
				callback(null, 'Update photo data failed', false, err);
	    	}else{
	    		callback(null, '', true, data);
	    	}
	    });
    }, 
    function(msg, isGetData, data, callback) {
    	var statusObj = new Status();
    	statusObj.set(isGetData, msg, data, callback);
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
PhotoFactory.prototype.removePhoto = function(key, result){
	Async.waterfall([ 
	function(callback) {
		dalPhoto.removePhotoData(key, function(err, data){
			if(err){
				callback(null, 'Remove photo data failed', false, err);
	    	}else{
	    		callback(null, '', true, data);
	    	}
	    });
    }, 
    function(msg, isGetData, data, callback) {
    	var statusObj = new Status();
    	statusObj.set(isGetData, msg, data, callback);
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
	// TODO 實體檔案刪除
};

/*
 * result:function(err, obj);
 */
PhotoFactory.prototype.getPhotoList = function(result){
	Async.waterfall([ 
	function(callback) {
		dalPhoto.getPhotoDataList(function(err, data){
			if(err){
				callback(null, 'Get photo data list failed', false, err);
	    	}else{
	    		if(data.length > 0){	    			
	    			callback(null, '', true, data);
	    		}else{
	    			callback(null, 'Data not found', false, data);
	    		}
	    	}
	    });
    }, 
    function(msg, isGetData, data, callback) {
    	var statusObj = new Status();
    	statusObj.set(isGetData, msg, data, callback);
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
PhotoFactory.prototype.getImg = function (width, height, strPath, result) {
	try{		
		var path = this.getImgPath + strPath.replace(/\'/g,"/");
		var key = width + height + strPath;		
		var ext = getExtension(path);
		var obj;		
		
		var useCache = function(){
			var show = false;
			if(!show){		
				if(obj.isReady == true){					
					result(null, obj);
					show = true;
				}else{
					//process.nextTick(useCache); //(node) warning: Recursive process.nextTick detected. This will break in the next version of node. Please use setImmediate for recursive deferral.
					setImmediate(useCache);
				}				
			}
		}
		
		if(Config.isUseCache){
			obj  = cache.get(key);
		}
		
		if(typeof obj === 'undefined'){				
			obj = new ImgCache();
			if(Config.isUseCache){
				cache.set(key, obj);	
			}
			
			Gm(path)
				.resize(width, height)
				.toBuffer(function (err, buffer) {
					obj.setImage(buffer, ext);					
					result(null, obj);					
				});			
		}else{			
			useCache();
		}		
	}catch(e){
		result(e.toString(), null);
	}	

	process.send({cmd : 'addReq', pid : process.pid, cacheSize : cache.keys().length});	
};

/*
 * result:function(err, obj);
 */
PhotoFactory.prototype.imgUpload = function(strID, mimetype, file, fileName, fileHome, fileFromPath, fileToPath, result) {
	var nameMap = this.nameMap;
	var typeMap = this.typeMap;
	
	Async.waterfall([
	function(callback) {
		fileName += nameMap[mimetype];
		fstream = Fs.createWriteStream(fileFromPath + fileName);
		file.pipe(fstream);
		fstream.on('close', function() {
			callback(null);
		});
	},
	function(callback) {
		var magic = new Magic(MMMagic.MAGIC_MIME_TYPE);
		magic.detectFile(fileFromPath + fileName, function(err, result) {
			if (err) {
				callback('Get file type failed.', 'PhotoFactory.imgUpload:mkdirParent');
			} else {
				callback(null, result);
			}
		});
	},
	function(result, callback) {
		if (typeMap[result] == true) {
			Fs.mkdirParent(fileHome + fileToPath, '0755', function(err) {
				if (err) {
					// nothing
					// callback('Created parent directory failed.:' + err.toString(),'PhotoFactory.imgUpload:mkdirParent');
				}
				callback(null);
			});
		} else {
			Fs.unlink(fileFromPath + fileName, function(err) {
				if (err) {
					callback('Incorrect Format, file delete failed.', 'PhotoFactory.imgUpload:unlink');
				} else {
					callback('Incorrect Format.', 'PhotoFactory.imgUpload:unlink');
				}
			});
		}
	},
	function(callback) {
		Fs.rename(fileFromPath + fileName, fileHome + fileToPath + fileName, function(err) {
			if (err) {
				callback('file rename failed.', 'PhotoFactory.imgUpload:rename');
			} else {
				callback(null);
			}
		});
	},
	function(callback) {
		new ExifImage({ image : fileHome + fileToPath + fileName }, function(error, exifData) {
			if (error) {
				callback(null, error);
			} else {
				callback(null, exifData);
			}
		});
	},
	function(exifData, callback) {
		var dataObj = new PhotoData();
		dataObj.set(strID, fileToPath, fileName, hostname + fileToPath + fileName, exifData, callback);
	},
	function(obj, callback) {
		dalPhoto.insertPhotoData(obj, function(err, data) {
			if (err) {
				callback(null, 'Insert photo data failed', false, err);
			} else {
				callback(null, '', true, data);
			}
		});
	}, 
	function(msg, isGetData, data, callback) {
		var statusObj = new Status();
		statusObj.set(isGetData, msg, data, callback);
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

module.exports = PhotoFactory;