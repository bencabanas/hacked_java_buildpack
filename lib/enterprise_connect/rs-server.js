/*
 * author: chia.chang@ge.com
 */

'use strict';

const net=require('net');
const WebSocketClient = require('websocket').client;
const http = require('http');
const RSSession = require('./lib/session');
const tunnel = require('tunnel');

class RSServer extends RSSession {

    constructor(options){
	
	super(options);

	const debug=this.debug('rs:server');

	let pool=this._pool;
	
	let sockets=this._sockets;

	//create super channel
	let superconn=new WebSocketClient();

	superconn.on('connectFailed', (error)=> {
	    this._debug(`${new Date()} Super Connection Error: ${error.toString()}`);
	});
	
	superconn.on('connect', (cg) => {

	    cg.once('error', (error)=> {
		debugger;
		this._debug(`${new Date()} gateway connection error: ${error.toString()}`);
	    });

	    cg.once('close', _=> {
		debugger;
		this._debug(`${new Date()} gateway connection closed`);
		
	    });

	    cg.on('ping',(cancel, d)=>{

		if (!d||d.length==0)
		    return;
		
		let _d=JSON.parse(d);


		debugger;
		
		switch (_d.msgType){

		case 'established':
		    if (_d.sessionId){

			let data=_d.sessionId;
			
			this._debug(`${new Date()} gateway connection{host=${options.gatewayHost},port=${options.gatewayPort}} established.`);
			
			this._debug(`${new Date()} session: ${data} established.`);
						
			let cr = net.connect(options.resourcePort, options.resourceHost, _ => {

			    let _sId=data, v=this._pool.get(_d.clientId);
			    
			    if (v){
				
				//let entry=this._pool.entries();
				//let v=entry.next();
				
				//sockets object for RSServer
				
				this._sockets.set(_sId,{gateway:v.client, resource:cr});
				
				this.pipeTwoWay(v.client,cr,_sId);
				
				this._pool.delete(_d.clientId);
				
				this._debug(`${new Date()} resource connection{host=${options.resourceHost},port=${options.resourcePort}} established`);

				this.emit('resource_connect', cr);
			    }
			    else {
				this._debug(`${new Date()} the server conection is forfeited due to the client ${_d.clientId} not found in queue.`);
			    }
			    //`connection to the gateway ${options.targetHost} has been established successfully.`);
			});
		    }
		    
		    break;
		    
		case 'standby':
		    this._debug(`${new Date()} Super Connection is now standby for connections.`);

		    break;
		    
		case 'request':
		    
		    debugger;
		    
		    addServerInst().then((c)=>{

			c.on('error', (error)=> {
			    debugger;
			    c.close();
			    this._debug(`${new Date()} gateway connection error: ${error.toString()}`);
			});

			c.on('close', _=> {
			    debugger;
			    this._debug(`${new Date()} gateway connection closed`);
			});

			this._pool.set(_d.clientId,{client:c});
			this.emit('gateway_connect',c);
			
		    });
		    
		    break;
		    
		default:
		    break;
		}
		
	    });

	    this._debug(`${new Date()} supper connection is established.`);
	    
	});
	
	let opts=JSON.parse(JSON.stringify(options));
	
	let _buf=new Buffer(opts.id+':'+opts.secret);

	//specify the connection type
	opts.clientType='admin';

	//remove secret for secure handshake
	delete opts.secret;
	
	let _opt=new Buffer(JSON.stringify(opts));

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
	
	superconn.connect(options.gatewayHost+':'+options.gatewayPort, null, null, _headers,requestOpts);
	
	let addServerInst=(oh)=>{

	    return new Promise((reso,reje)=>{

		debugger;
		//dial in to the gateway
		let gateway = new WebSocketClient();

		gateway.on('connectFailed', (error)=> {
		    this._debug(`${new Date()} Connect Error: ${error.toString()}`);
		    
		    return reje(error);
		});

		gateway.on('connect', (cg) => {
		    debugger;
		    return reso(cg);		    
		});

		debugger;
		
		let opts=JSON.parse(JSON.stringify(options));

		let _buf=new Buffer(opts.id+':'+opts.secret);

		//specify the connection type
		opts.clientType='server';

		debugger;
		
		//remove for security
		delete opts.secret
		
		let _opt=new Buffer(JSON.stringify(opts));


		
		let _headers={
		    'Authorization':'Basic '+_buf.toString('base64'),
		    'options':_opt.toString('base64'),
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

		debugger;

		gateway.connect(options.gatewayHost+':'+options.gatewayPort, null, null, _headers,requestOpts);

	    }); 
	    
	};

    };

        
}

//discard the self-signed cert error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports=RSServer;
