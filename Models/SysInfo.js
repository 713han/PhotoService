var SysInfo = function(){		
	this.pid;
	this.workerID;
	this.numReqs = 0;
	this.cacheSize = 0;
}

SysInfo.prototype.addReqs = function (cacheSize){
	this.numReqs++;
	this.cacheSize = cacheSize;
}

module.exports = SysInfo;