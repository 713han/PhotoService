// 2014.10.31 1636 Trunk
var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	cluster = require('cluster'),
	express = require('express'),
	favicon = require('serve-favicon'),	
	busboy = require('connect-busboy'),
		
	app = express(),	
	server = http.createServer(app),
	monitor = http.createServer(app),
	
	//server config
	config = require('./config'),
	port = config.port, 
	thQty = config.thQty,
	imgHome = config.imgHome,
	uploadSize = config.uploadSize,
	
	//express config
	cacheTime = config.cacheTime;
	
//Controller
var picsController = require('./photoController');

if (cluster.isMaster) {
	var workers = {},
	io = require('socket.io').listen(monitor);

	monitor.listen(8081);
		
	process.title = 'PhotoService Master';
	picsController.log(process.title + ' started');
	
	// 根據 CPU 個數來啟動相應數量的 worker
	for (var i = 0; i < thQty; i++) {
		newThread();	
	}
	
	process.on('SIGHUP', function() {
		// master 進程忽略 SIGHUP 信號
	});

	cluster.on('exit', function(worker) {
		delete workers[worker.process.pid];
		picsController.log('PhotoService #' + worker.process.pid + ' worker died');
		io.sockets.emit('threadDied', worker.process.pid);
		newThread();
	});
	
	// 監測文件改動，如果有修改，就將所有的 worker kill 掉
	fs.watch(__dirname, function(event, filename) {		
		killAllThread();
	});
	
	io.sockets.on('connection', function(socket) {
		var intervalID;
		socket.on('start', function() {
			intervalID = setInterval(function() {
				socket.emit('updateStatus', workers);
			}, 1000);
		});	
		
		socket.on('stop', function() { 
			clearInterval(intervalID);
		});
		
		socket.on('disconnect', function() { 
			clearInterval(intervalID);
		});
	});
	
	function newThread(){
		var worker = cluster.fork();
		worker.on('message', msgHandler);
		
		var sysObj = new syInfoObj();
		sysObj.pid = worker.process.pid;
		sysObj.workerID = worker.id;

		workers[worker.process.pid] = sysObj;	
		io.sockets.emit('threadStart', worker.process.pid);
	}
	
	function killAllThread(){
		for(var pid in workers){
			cluster.workers[workers[pid].workerID].kill();	
			delete workers[pid];					
		}
	}
	
	function msgHandler(msg){
		switch(msg.cmd){
			case 'addReq':
				workers[msg.pid].addReqs(msg.cacheSize);
				break;
			case 'reset':		
				killAllThread();
			default:
				break;
		}		
	}
	
} else {
	process.title = 'PhotoService@' + port + ' #' + process.pid;
	picsController.log(process.title + ' worker started');

	process.on('SIGHUP', function() {
		// 接收到 SIGHUP 信號時，關閉 worker
		process.exit(0);
	});

	server.listen(port);
}

app.use(favicon(__dirname + '/public/2010favicon.ico'));
app.use(express.static(imgHome, { maxAge: cacheTime }));
app.use(busboy({	
	limits: {
		fileSize: uploadSize
	}
}));

app.get('/photo/', function (req, res) {
	res.sendFile('monitor.html', { root: path.join(__dirname, './public') });
});

app.get('/photo/version', function (req, res) {		
	res.send('Ver:' + config.version); 
});

app.get('/photo/ip', function (req, res) {	
	var ip = req.headers['x-real-ip'] || req.connection.remoteAddress ;	
	res.send(ip); 
});

app.get('/photo/:width/:height/:path', function(req, res, next){
	picsController.getImg(req, res, next);
});

app.post('/photo/fileupload', function(req, res){
	picsController.imgUpload(req, res);
});

app.get('/photo/get/:strID', function(req, res){
	picsController.getPhoto(req, res);
});

app.get('/photo/save/:strID', function(req, res){
	picsController.savePhoto(req, res);
});

app.get('/photo/update/:strID', function(req, res){
	picsController.updatePhoto(req, res);
});

app.get('/photo/remove/:strID', function(req, res){
	picsController.removePhoto(req, res);
});

app.get('/photo/photoList', function(req, res){
	picsController.getPhotoList(req, res);
});

function syInfoObj(){
	var obj = {};
	
	obj.pid;
	obj.workerID;
	obj.numReqs = 0;
	obj.cacheSize = 0;
	
	obj.addReqs = function (cacheSize){
		obj.numReqs++;
		obj.cacheSize = cacheSize;
	}		
	return obj;
}

app.get('/photo/file/', function (req, res) {
	res.sendFile('file.html', { root: path.join(__dirname, './public') });
});

	
//--Debug--
/* no use
app.get('/mallimg/file/', function (req, res) {
	res.sendFile('file.html', { root: path.join(__dirname, './public') });
});
app.get('/mallimg/doc/', function (req, res) {
	res.sendFile('doc.html', { root: path.join(__dirname, './public') });
});

app.get('/mallimg/config', function (req, res) {	
	res.send(config);
});

app.get('/mallimg/reset', function (req, res) {	
	res.send('cmd has been sent');
	process.send({cmd : 'reset', pid : process.pid});	
});


app.get('/mallimg/mkdir', function (req, res) {	
	fs.mkdirParent(imgHome + req.query.path ,'0775', function(){
		msgResponse(res,true,'mkdir success');
	});		
});

app.get('/mallimg/Info/:path', function (req, res) {
	var contentTypeArray = {
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.gif': 'image/gif',
			'.png': 'image/png',
			'.bmp': 'image/bmp'
		};
		
	var path = req.params.path.replace(/\'/g,"/");
	var ext = getExtension(path);
	console.log("path:" + req.params.path);
	console.log("replace path:" + path);
	console.log("ext:" + ext);
	console.log("contentType:" + contentTypeArray[ext]);
	res.send("success");
});

app.get('/mallimg/cacheInfo', function (req, res) {	
	res.send(process.title + ":Cache Size:" + cache.keys().length);
});

app.get('/cache/:key/:value', function (req, res) {
	console.log("key:" + req.params.key + " val:" + req.params.value);
	cache.set(req.params.key,req.params.value);
	res.send(cache.keys());
	
});

app.get('/obj/:key', function (req, res) {
	var key = req.params.key
	var obj = cache.get(key);
	if(typeof buff === 'undefined'){
		obj = new imgObj();
	}else{
	
	}
});
*/
//--Debug

 
 
