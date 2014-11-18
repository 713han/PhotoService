var PhotoFactory = require('./PhotoFactory');
var photoObj = new PhotoFactory();

var PhotoController = function(){
	
}

PhotoController.prototype.getPhoto = function(req, res){
	photoObj.getPhoto(req, res);
};

PhotoController.prototype.updatePhoto = function(req, res){	
	photoObj.updatePhoto(req, res);	
};

PhotoController.prototype.removePhoto = function(req, res){	
	photoObj.removePhoto(req, res);			
};

PhotoController.prototype.getPhotoList = function(req, res){
	photoObj.getPhotoList(req, res);
};

PhotoController.prototype.getImg = function (req, res, next) {	
	photoObj.getImg(req, res, next);
};

PhotoController.prototype.imgUpload = function(req, res) {
	photoObj.imgUpload(req, res);
};

module.exports = PhotoController;