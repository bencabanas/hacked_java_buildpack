/*
 * author: chia.chang@ge.com
 */

'use strict';

const net=require('net');
const WebSocketClient = require('websocket').client;
const http = require('http');
const RSSession = require('./lib/session');
const tunnel = require('tunnel');

class RSClient extends RSSession {

    constructor(options){
	
	super(options);
	
	const debug=this.debug('rs:client');

	let sockets=this._sockets;

	const rsClient=net.createServer();
	
	rsClient.listen(options.localPort,_=>{
	    debug(`${new Date} client is listening on local port# ${options.localPort}`);
	});
	
	rsClient.on('connection', _c => {
	    
	    //let _sId=this.generateSessionId();
	    
	    debug(`${new Date} new connection: port=${options.localPort}, remote { host=${_c.remoteAddress}, port=${_c.remotePort} }`);
	    
            this.emit('client_connect', _c);
	    
	    _c.once('close', _ => {
		
		debug(`${new Date} connection close: port=${options.localPort}, remote { host=${_c.remoteAddress}, port=${_c.remotePort} }`);
	    });

	    let gateway = new WebSocketClient();

	    gateway.on('connectFailed', (error)=> {
		debug(`${new Date()} Connect Error: ${error.toString()}`);
	    });

	    gateway.on('connect', (c) => {

		debugger;
		c.on('error', (error)=> {
		    debug(`${new Date()} gateway connection error: ${error.toString()}`);
		});

		c.on('close', _=> {
		    debug(`${new Date()} gateway connection closed`);
		});

		c.on('ping',(cancel, d)=>{

		    debugger;
		    
		    if (!d||d.length==0)
			return;

		    let _d=JSON.parse(d);

		    
		    if (_d.sessionId){

			let _sid=_d.sessionId;
			
			//sockets object for RSClient
			sockets.set(_sid,{gateway:c, client:_c});

			this.pipeTwoWay(c,_c,_sid);

			debug(`${new Date()} gateway connection{host=${options.gatewayHost},port=${options.gatewayPort}} established.`);
			
			debug(`${new Date()} session: ${_sid} established.`);
			
			this.emit('gateway_connect',c);
		    }
		});
	    });

	    let opts=JSON.parse(JSON.stringify(options));
	
	    //specify the connection type
	    opts.clientType='client';

	    let _buf=new Buffer(opts.id+':'+opts.secret)

	    //remove for the security
	    delete opts.secret
	    
	    let _opt=new Buffer(JSON.stringify(opts))

	    let _headers={
		'Authorization':'Basic '+_buf.toString('base64'),
		'options':_opt.toString('base64')
	    };

	    let requestOpts=null;
	    
	    if (options.proxy){
		let tunnelingAgent = tunnel.httpsOverHttp({
		    proxy: options.proxy
		});

		requestOpts = {
		    agent: tunnelingAgent
		};
	    }
	    
	    gateway.connect(options.gatewayHost+':'+options.gatewayPort, null, null, _headers,requestOpts);
	    
	});

	rsClient.on('error', err => {
            debug(`${new Date()} local port connection error: port=${options.localPort}, error=${err}`);
            this.emit('client_error', options.localPort, err);
	});

	rsClient.on('close', _ => {
            debug(`${new Date()} local port close: port=${options.localPort}`);
            this.emit('client_close', port);
	});
    }

}

//discard the self-signed cert error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports=RSClient;
