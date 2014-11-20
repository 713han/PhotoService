var
	UtilObject = require(appRoot + '/Models/UtilObject');

var
	utilObj = new UtilObject();	
	
var ProfileData = function(){
	this.name = '';
	this.email = '';
	this.password = '';
	this.ProfilePhoto = '';
	this.lastLoginDate = '';	
}

/*
 * result:function(err, obj);
 */
ProfileData.prototype.set = function(name, email, pw, result){
	
	this.name = name;
	this.email = email;
	this.password = utilObj.getSHA256Hash(pw);
	this.lastLoginDate = utilObj.getNowDateString();
	
	result(null, this);
}

module.exports = ProfileData;