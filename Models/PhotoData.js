var PhotoData = function(){
		
	this._id = 0;
	this.strID = '';
	this.path = '';
	this.filename = '';
	this.url = '';
	this.createDate = '';
	this.exif = {};
}

PhotoData.prototype.set = function(id, path, filename, url, exif, callback){
	this.strID = id;
	this.path = path;
	this.filename = filename;
	this.url = url;
	this.exif = exif;
	
	callback(this);
}

module.exports = PhotoData;