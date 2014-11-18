var config = {}

config.hostname = 'http://192.168.56.103/';
config.port = 8080;
config.version = '0.1.0';
//config.thQty = require('os').cpus().length;
config.thQty = 1;
config.isUseCache = true;
config.cacheTime = 1000 * 60 * 60 * 24 * 7, //ms * s * min * hour * day = week 
//config.cacheTime = 31557600000, //milliseconds in one year
config.lruOptions = {
	max: 5000,					   
	dispose: function (key, n) { n = 0; }, 
	maxAge: 1000 * 60 * 60 //milliseconds in 1 hour
}; 
config.debug = true;

config.imgHome = '/home/OriginPhoto/'; //CentOS testing production

config.ipLimit = {
	'10.2.10.15' : true,
	'192.168.56.2' : true
};
				 
config.uploadSize = 5 * 1024 * 1024; //byte * K * M = MB 

config.MySqlConn = {
	host: '127.0.0.1',
	user: 'hanshuang',
	password: '0000',
	database: 'hanshuang'
};

config.MongoDBConn = 'mongodb://127.0.0.1:27017/PhotoService';

module.exports = config;
