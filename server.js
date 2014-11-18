// 2014.10.31 1636 Trunk
var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	cluster = require('cluster'),
	express = require('express'),
	favicon = require('serve-favicon'),	
	busboy = require('connect-busboy'),
	bodyParser = require('body-parser'),
	url = require('url'),
		
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
	cacheTime = config.cacheTime,
	
	//object
	UtilObject = require('./UtilObject'),
	utilObj = new UtilObject(),
	SysInfo = require('./Models/SysInfo');
	
	
//Controller
var PhotoController = require('./PhotoController');
var photo = new PhotoController();

var profileController = require('./ProfileController');
var profile = new profileController();

if (cluster.isMaster) {
	var workers = {},
	io = require('socket.io').listen(monitor);

	monitor.listen(8081);
		
	process.title = 'PhotoService Master';
	utilObj.log(process.title + ' started');
	
	// 根據 CPU 個數來啟動相應數量的 worker
	for (var i = 0; i < thQty; i++) {
		newThread();	
	}
	
	process.on('SIGHUP', function() {
		// master 進程忽略 SIGHUP 信號
	});

	cluster.on('exit', function(worker) {
		delete workers[worker.process.pid];
		utilObj.log('PhotoService #' + worker.process.pid + ' worker died');
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
		
		sysObj = new SysInfo();
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
	utilObj.log(process.title + ' worker started');

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.param(function(name, fn) {
	if (fn instanceof RegExp) {
		return function(req, res, next, val) {
			var captures;
			if (captures = fn.exec(String(val))) {
				req.params[name] = captures;
				next();
			} else {
				next('route');
			}
		}
	}
});

app.route('/photo/')
	.get(function (req, res) {
		res.sendFile('monitor.html', { root: path.join(__dirname, './public') });
	});

app.route('/photo/version')
	.get(function (req, res) {		
		res.send('Ver:' + config.version); 
	});

app.route('/photo/ip')
	.get(function (req, res) {	
		var ip = req.headers['x-real-ip'] || req.connection.remoteAddress ;	
		res.send(ip); 
	});

app.param('width', /^\d+$/);
app.param('height', /^\d+$/);
app.route('/photo/:width/:height/:path')
	.get(photo.getImg);

app.route('/photo/fileupload')
	.post(photo.imgUpload);

app.route('/photo/get/:strID')
	.get(photo.getPhoto);

app.route('/photo/update/:strID')
	.get(photo.updatePhoto);

app.route('/photo/remove/:strID')
	.get(photo.removePhoto);

app.route('/photo/photoList')
	.get(photo.getPhotoList);

app.route('/photo/file')
	.get(function (req, res) {
		res.sendFile('file.html', { root: path.join(__dirname, './public') });
	});
	
app.route('/photo/profile/register')
	.get(function(req, res){
		res.sendFile('register.html', { root: path.join(__dirname, './public') });
	})
	.post(profile.register);
	
app.route('/photo/profile/get/:id')
	.get(profile.getProfile);


	
//--Debug--
/* no use
app.route('/photo/paramTest/:param?')
	.get(function(req, res){
		var query = url.parse(req.url, true).query;
		console.log(query);
		console.log(req.params);
		res.sendFile('paramTest.html', { root: path.join(__dirname, './public') });
	})
	.post(function(req, res){
		console.log(req.param);
		res.send(req.body);
	});
*/
//--Debug

 
 
