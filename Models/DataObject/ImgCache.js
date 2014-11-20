var ImgCache = function(){			
	
	this.contentTypeArray = {
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.gif': 'image/gif',
		'.png': 'image/png',
		'.bmp': 'image/bmp'
	};
	
	this.buffer = 0;
	this.isReady = false;
	this.ext = '';
	this.contentType = '';
}

ImgCache.prototype.setImage = function(data, extname){
	this.buffer = data;		
	this.ext = extname;
	this.contentType = this.contentTypeArray[extname];
	this.isReady = true;
};

module.exports = ImgCache;