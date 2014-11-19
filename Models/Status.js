var Status = function(){
	this.status = false;
	this.msg = '';
	this.Object = {};
}	

/*
 * result:function(err, obj);
 */
Status.prototype.set = function(status, msg, data, result){
	this.status = status;
	this.msg = msg;
	this.Object = data;
	
	result(null, this);
}

module.exports = Status;