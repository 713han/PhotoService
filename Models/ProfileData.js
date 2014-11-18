var ProfileData = function(){
	this.name = '';
	this.email = '';
	this.password = '';
	this.ProfilePhoto = '';
	this.lastLoginDate = '';	
}

ProfileData.prototype.set = function(name, email, pwHash, callback){
	var t = new Date();
	this.name = name;
	this.email = email;
	this.password = pwHash;
	this.lastLoginDate = t.toISOString();
	
	callback(this);
}

module.exports = ProfileData;