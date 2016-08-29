/*
 * predix cf portal
 * author: chia.chang@ge.com
 */

var obj={host:'http://localhost',apppath:'',frontendpath:'',port:3131,isdev:false,index:'index.html'},
    _tau=require('taurus-express-light'),
    _tel=new _tau();
    _url=require('url'),
    _fs=require('fs');
    //postgresSQL node 
    _pg = require('pg'),

    //mongodb node cli module
    _mongo=require('mongoose'),
    //node verison of JPA
    _kit={},
    //tunneling service lib
    PHClient=require('./../ph-client'), 
    _killCORS=function(req,res,next){
	if(req.url.indexOf('.css')>0)
            res.setHeader('Content-Type','text/css');

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Headers', 'Authorization');
	
	next();
    },
    _svcInfo=(process.env.VCAP_SERVICES&&JSON.parse(process.env.VCAP_SERVICES)),
   _appInfo=(process.env.VCAP_APPLICATION&&JSON.parse(process.env.VCAP_APPLICATION));


    
console.log('__dirname: '+__dirname);

_tel.path(obj.apppath);

_tel.index(obj.index);

//support cross-domain
_tel.pre(_killCORS);


/*
test works
*/
_tel.get('/addcat/:name/:type',(req,res)=>{

    console.log('mongodb://localhost:31375/test');
    _mongo.connect('mongodb://localhost:31375/test');

    var db = _mongo.connection;
    
    db.on('error', function(err){

	console.log('connection error:',err);
	db.close();
	_mongo.disconnect();
	    
    });
    
    db.once('open', function() {
	console.log('connected to MongoDB server!');

	console.log(haru);
	
	var haru = new _kit({ name: req.params.name, type:req.params.type });

	haru.save(function(err,haru){
	    db.close();
	    _mongo.disconnect();
	    res.writeHead(200,{"Content-Type":"application/json"})
	    return res.end(JSON.stringify(haru));
	    
	});

    });
    
});

_tel.get('/listcats',(req,res)=>{
    
    console.log('mongodb://localhost:31375/test');
    _mongo.connect('mongodb://localhost:31375/test');
    var db = _mongo.connection;

    _kit.find((err,kits)=>{
	db.close();
	_mongo.disconnect();
	    
	res.writeHead(200,{"Content-Type":"application/json"})
	return res.end(JSON.stringify(kits));	    
    });

});


_tel.get('/pg/listbirds',(req,res)=>{
    var _con='postgres://postgres:12345@localhost:31376/hogwarts',
	_client = new _pg.Client(_con);
    
    _client.connect(function(err) {
	if(err) {
	    return console.error('could not connect to postgres', err);
	}
	
	_client.query('select * from birds', function(err, result) {
	    if(err) {
   		res.writeHead(500,{"Content-Type":"application/json"})
		res.end(JSON.stringify(err));
		return _client.end();	
	    }
	    res.writeHead(200,{"Content-Type":"application/json"})
	    res.end(JSON.stringify(result));	    
	    return _client.end();
	    
	});
    });

});	
   

_tel.get('/pg/addbird/:name/:type',(req,res)=>{
    var _con='postgres://postgres:12345@localhost:31376/hogwarts',
	_client = new _pg.Client(_con);
    
    _client.connect(function(err) {
	if(err) {
	    return console.error('could not connect to postgres', err);
	}
	
	_client.query('insert into birds (name,type) values ($1,$2)',
		      [req.params.name,req.params.type],function(err, result) {
			  
	    if (err) {
   		res.writeHead(500,{"Content-Type":"application/json"})
		res.end(JSON.stringify(err));
		return _client.end();	
	    }
	    res.writeHead(200,{"Content-Type":"application/json"})
	    res.end(JSON.stringify(result));	    
	    return _client.end();
	    
	});
    });

});	

_tel.static('/','./public'/*, _auth*/);


var _getEnvs=function(){
    return new Promise(function(reso,reje){
	if (!_svcInfo||!_appInfo){
	    _fs.readFile('./envs.json', 'utf8', function (err, data) {
		if (err) throw err;

		var _op = JSON.parse(data);
		_appInfo=_op.VCAP_APPLICATION;
		_svcInfo=_op.VCAP_SERVICES;

		reso(true);
	    });
	    
	}
	else{
	    reso(true);
	}
    });    
};

_getEnvs().then(function(val){

    obj.port=parseInt(process.env.PORT||obj.port);
    _tel.listen(obj.port);
    console.log('app listen to port#'+obj.port);

    var kittySchema = _mongo.Schema({ name: String,type: String });

    _kit = _mongo.model('Kitten', kittySchema);
        
});

//get an open port in CF
/*const _conn=(pt)=>{
    try{
	const _phc=new PHClient({localPort:pt,remoteAddress:'54.88.81.181',remotePort:3001});
    }
    catch(ex){
	pt+=10;
	_conn(pt);
    }
}*/

const _ph_mongo=new PHClient({
    localPort:31375,
    serviceHost:'54.88.81.181',
    servicePort:3001,
    clientId: 'ClientId-B',
    clientSecret: '1234',
    cert: '2323r23r34hhhH(*HOUou4on34',
    'ssl-cert': 'xxwewr34t34t34t'
});

const _ph_pg=new PHClient({
    localPort:31376,
    serviceHost:'54.88.81.181',
    servicePort:3001,
    clientId: 'ClientId-A',
    clientSecret: '1234',
    cert: '2323r23r34hhhH(*HOUou4on34',
    'ssl-cert': 'xxwewr34t34t34t'
});
