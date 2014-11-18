var Status = function(){
	this.status = false;
	this.msg = '';
	this.Object = {};
}	

Status.prototype.set = function(status, msg, data, callback){
	this.status = status;
	this.msg = msg;
	this.Object = data;
	
	callback(null, this);
}

module.exports = Status;