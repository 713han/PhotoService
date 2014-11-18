var ProfileFactory = require('./ProfileFactory');
var profileObj = new ProfileFactory();

var ProfileController = function(){
	
}

ProfileController.prototype.register = function(req, res){
	profileObj.register(req, res);
}
	
ProfileController.prototype.getProfile = function(req, res){	
	profileObj.getProfile(req, res);
}

module.exports = ProfileController;