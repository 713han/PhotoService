var ProfileController = (function(o){
	"use strict";
	
	var
		config = require('./config'),
		utilObj = require('./UtilObject'),
		dalProfile = require('./DALMysqlProfile');			
	
	dalProfile.init();		
	
	o.init = function(){
		initOnce();
		bindEvent();		
	}
	
	var initOnce = function(){		
			
	}
	
	var bindEvent = function(){
		
	}	
	
	o.register = function(req, res){
		var 
			name = req.body.name,
			email = req.body.email,
			pwHash = req.body.pwdHash;
			
		var userData = new dalProfile.ProfileData();
		
		userData.set(name, email, pwHash, function(userData){
			dalProfile.insert(userData, function(statusObj){
				utilObj.objResponse(res, statusObj);
			});
		});
	}
	
	o.getProfile = function(req, res){		
		var key = req.params.id;
		dalProfile.getData(key, function(statusObj){
			utilObj.objResponse(res, statusObj);
		});	
	}
	
	return o;
	
})( ProfileController || {} );

module.exports = ProfileController;