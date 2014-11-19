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
ProfileData.prototype.set = function(name, email, pwHash, result){
	var t = new Date();
	this.name = name;
	this.email = email;
	this.password = pwHash;
	this.lastLoginDate = t.toISOString();
	
	result(null, this);
}

module.exports = ProfileData;