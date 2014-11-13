var UtilObject = (function(o){
	"use strict";	
	
	var initOnce = function(){		
		
	}
	
	var bindEvent = function(){
		
	}	
	
	o.init = function(){
		initOnce();
		bindEvent();		
	}	
	
	o.statusObj = function(){
		var obj = {};		
		
		obj.status = false;
		obj.msg = '';
		obj.Object = {};
		
		obj.set = function(status, msg, data, callback){
			obj.status = status;
			obj.msg = msg;
			obj.Object = data;
			
			callback(obj);
		}
		
		return obj;
	}	
	
	return o;
	
})( UtilObject || {} );

module.exports = UtilObject;