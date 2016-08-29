/*
 * author: chia.chang@ge.com
 */

'use strict';

const net=require('net');
const fs = require('fs');
const WebSocketServer = require('websocket').server;
const http = require('http');
const https = require('https');
const RSAuth = require('./lib/auth');
const RSSession = require('./lib/session');
const RSIPFilter = require('./lib/ipfilter');

class RSGateway extends RSSession {

    constructor(options){

	super(options);	
	
	const auth=new RSAuth(options);

	const filter=new RSIPFilter(options);

	const adm_sockets=this.adm_sockets;

	const pool=this._pool;
	
	const debug=this.debug('rs:gateway');

	const sessions=this._sockets;
	
	const originIsAllowed = (origin) => {
	    //implementing the originIsAllow logic later for predix security
	    return true;
	}

	let httpServer;

	//if secured channel is needed
	if (options.ssl){
	    // ssl cert 
	    let sslOps = {
		key: fs.readFileSync(`${options.ssl.key}`),
		cert: fs.readFileSync(`${options.ssl.cert}`)
	    };
    
	    httpServer = https.createServer(sslOps,(req, res)=>{
		debug(`${new Date()} Received request for ${req.url} but gateway failed to pick up.`);
		res.writeHead(404);
		res.end();
	    });

	}
	else {
	    httpServer = http.createServer((req, res)=>{
		debug(`${new Date()} Received request for ${req.url} but gateway failed to pick up.`);
		res.writeHead(404);
		res.end();
	    });

	}
		
	httpServer.listen(options.localPort, _=> {
	    debug(`${new Date()} rs-gateway is listening on port#${options.localPort}`);    
	    this.emit(`gateway_listening`);
	});

	//accept ssl/nonssl connection
	const rsGateway = new WebSocketServer({
	    httpServer: httpServer,
	    autoAcceptConnections: false,
	    keepalive:true,
	    keepaliveInterval:(options.keepAlive/2),
	    dropConnectionOnKeepaliveTimeout:true,
	    keepaliveGracePeriod:options.keepAlive
	});

	rsGateway.on('request', (request)=> {

	    let _ci = (new Buffer(request.httpRequest.headers['authorization'].split(' ')[1], 'base64')).toString().split(':');    
	    let _tc = JSON.parse(new Buffer(request.httpRequest.headers['options'],'base64').toString());

	    //Let the IP filtering begins
	    
	    let rip=request.httpRequest.headers['x-forwarded-for']||request.remoteAddress;

	    if (filter.isInBlockList(rip,_tc.id)||
	        !filter.isInWhiteList(rip,_tc.id)){
		request.reject();
		return debug(`${new Date()} Connection from ${rip} rejected.`);
	    }

	    if (!originIsAllowed(request.origin)) {
		request.reject();
		return debug(`${new Date()} Connection from origin ${request.origin} rejected.`);
	    }

	    debugger;
	    
	    _tc.secret=_ci[1];
	    
	    auth.validate(_tc).then(info=>{
		
		/*
		 * when authentication is valid.
		 *
		 */

		let c = request.accept(request.origin);

		debug(`${new Date()} new connection established {host=${c.socket.remoteAddress}, port=${c.socket.remotePort}}`);
		
		this.emit('connection_accepted', options.localPort, c);

		if (_tc.clientType=='admin'){

		    this.adm_sockets.set(_ci[0],{option:_tc,admin:c});

		    c.on('error', err => {
			debug(`${new Date()} super connection err ${err} for server ${_ci[0]}.`);
			this.adm_sockets.delete(_ci[0]);
			this.emit('super_connection_error', options.localPort, err);
		    });

		    c.on('close', _ => {
			debug(`${new Date()} super connection close for server ${_ci[0]}.`);
			this.adm_sockets.delete(_ci[0]);
			this.emit('port_close', options.localPort);
		    });

		    return;
		}
		
		if (_tc.clientType=='server'){			    

		    debugger;
		    
		    let adm=this.adm_sockets.get(_ci[0]);

		    if (!adm){
			debug(`${new Date()} associate supper channel not found. client=${_ci[0]}`);
			return c.close();
		    }

		    //
		    let _sId=this.generateSessionId();
		    
		    sessions.set(_sId,{server:c,serverOptions:_tc});

		    //find any pending client by the server id
		    let p=this.getPendingCSocketInPool(_ci[0]);

		    if (p){
			let cp=this._pool.get(p);
			
			return this.clientSessionBind(_sId, cp.client,cp.options);
			
		    }

		    //let the server know the sessionId
		    adm.admin.ping(JSON.stringify({msgType:'standby',sessionId:_sId}));

		    debugger;
		    
		    debug(`${new Date()} session ${_sId} created for the dedicated resource {host=${c.socket.remoteAddress}, port=${c.socket.remotePort}, client=${_tc.id}}`);
		    
		    return this.emit('session_create',_sId);

		}
		
		if (_tc.clientType=='client')
		{

		    let _sId=this.getAvailableSessionByServerId(_tc.targetServerId);
		    
		    if (_sId){
			//resource is found. two-way binding begin.
			return this.clientSessionBind(_sId,c, _tc);
		    }
		    

		    debug(`${new Date()} client ${_ci[0]} awaits resource connection ${_tc.targetServerId}`);

		    let _a=this.adm_sockets.get(_tc.targetServerId);

		    if (_a){

			debugger;
			
			_a.admin.ping(JSON.stringify({msgType:'request',clientId:_ci[0]}));

			return this._pool.set(_ci[0],{client:c,options:_tc});

		    }

		    debug(`${new Date()} associate supper channel not found. client=${_ci[0]} channel=${_tc.targetServerId}`);
		    return c.close(c.CLOSE_REASON_ABNORMAL,`${new Date()} fail to find the associate supper channel ${_tc.targetServerId}.`);
		    
		}
		
		c.once('close', (reasonCode, description)=> {
		    debug(`${new Date()} client ${_ci[0]} {type:${_tc.clientType}, host:${c.socket.remoteAddress}, port:${c.socket.remotePort}} disconnected.`);
		    this.emit('session_close');
		});
		
	    }).catch((err)=>{
		request.reject();
		return debug(`${new Date()} ${err}`);
	    });
	});
	
	//optional event emitter
	rsGateway.on('error', err => {
	});

	//optional event emitter
	rsGateway.on('close', _ => {
	});

    }

    clientSessionBind(sid,csocket, tc){
	
	let _a=this.adm_sockets.get(tc.targetServerId);

	if (!_a){
	    this.debug(`${new Date()} associate supper channel not found. client=${tc.targetServerId}`);
	    csocket.close();
	    return;
	}

	let _op=this._sockets.get(sid);
	_op.client=csocket;
	_op.clientOptions=tc;
	
	this.emit('session_join', sid);

	this.pipeTwoWay(_op.client, _op.server, sid);
	
	this._debug(`${new Date()} target resource ${tc.targetServerId} found. connection for ${tc.id} established.`);

	this._pool.delete(tc.id);
	//let the server know the sessionId
	_a.admin.ping(JSON.stringify({msgType:'established',sessionId:sid, clientId:tc.id}));

	//let the client know the sessionId
	_op.client.ping(JSON.stringify({sessionId:sid}));
	
	debugger;
	
    }

    getPendingCSocketInPool(serverId){
	for (var [key, val] of this._pool) {
	    
	    if (val.options&&val.options.targetServerId.indexOf(serverId)>-1){
		debugger;
		return key;
	    }
	}

	return false;

    }
}

module.exports=RSGateway;
