var 
	ProfileFactory = require(appRoot + '/Models/ProfileFactory'),
	UtilObject = require(appRoot + '/Models/UtilObject');

var 
	profileObj = new ProfileFactory(),
	utilObj = new UtilObject();

var ProfileController = function(){
	
}

ProfileController.prototype.register = function(req, res){
	var 
		name = req.body.name,
		email = req.body.email,
		pw = req.body.pw;
	
	profileObj.register(name, email, pw, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
}

ProfileController.prototype.verify = function(req, res){
	var 
		email = req.body.email,
		pw = req.body.pw;
	
	profileObj.verify(email, pw, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
}
	
ProfileController.prototype.getProfile = function(req, res){
	var key = req.params.id;
	
	profileObj.getProfile(key, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
}

ProfileController.prototype.getProfileList = function(req, res){
	var page = req.params.page;
	var itemPerPage = req.params.itemPerPage;
	
	profileObj.getProfileList(page, itemPerPage, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
}

ProfileController.prototype.removeProfile = function(req, res){
	var key = req.params.id;
	
	profileObj.remove(key, function(err, obj){
		if(err){
			utilObj.errResponse(res, err);
		}else{
			utilObj.objResponse(res, obj);
		}
	});
}

module.exports = ProfileController;