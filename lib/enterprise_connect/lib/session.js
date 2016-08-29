/*
 * author: chia.chang@ge.com
 */

'use strict';

const RSCommon = require('./common');

class RSSession extends RSCommon {

    constructor(options){
	super(options);

	this._sockets=new Map();
	this._options=options;
	this._pool=new Map();
	this.adm_sockets=new Map();
	
    }
        
    getAvailableSessionByServerId(cid){	

	debugger
	for (var [key, val] of this._sockets) {
	    debugger;
	    if (val.client==null&&val.serverOptions.clientId.indexOf(cid)>-1){
		debugger;
		return key;
	    }
	}

	return false;

    }

    DeleteAllSessions(){
	for (var [key, val] of this._sockets) {	    
	    this.DeleteASession(key);
	}
    }

    GetASessionDetails(sid){
	return this._sockets.get(sid);
    }

    GetAllSessionIds(){
	return this._sockets.keys();
    }
    
    generateSessionId() {
	return Date.now() + '.' + this.randomString(16);
    };

    DeleteASession(sid){

	let socket=this._sockets.get(sid);

	if (!socket)
	    return;
	
	//client. ws/rs
	socket.client&&socket.client.destroy&&socket.client.destroy();
	socket.client&&socket.client.end&&socket.client.end();
	socket.client&&socket.client.close&&socket.client.close();

	//gateway. ws only
	//socket.gateway&&socket.gateway.destroy&&socket.gateway.destroy();
	//socket.gateway&&socket.gateway.end&&socket.gateway.end();
	socket.gateway&&socket.gateway.close&&socket.gateway.close();

	//server. ws only
	//socket.server&&socket.server.destroy&&socket.server.destroy();
	//socket.server&&socket.server.end&&socket.server.end();
	socket.server&&socket.server.close&&socket.server.close();

	//resource. rs only
	socket.resource&&socket.resource.destroy&&socket.resource.destroy();
	socket.resource&&socket.resource.end&&socket.resource.end();
	//socket.resource&&socket.resource.close&&socket.resource.close();

	//this.adm_sockets.delete(socket.clientOptions&&socket.clientOptions.targetServerId||
	//			socket.serverOptions&&scoket.serverOptions.clientId);

	//this._pool.delete(socket.clientOptions&&socket.clientOptions.clientId);
	
	this._sockets.delete(sid);

	this._debug(`${new Date} session ${sid} has been deleted.`);
	this.emit('session_delete',sid);
    }

    pipe(source, dest, sid){

	debugger;
	const addr = (source.address?source.address():(source.socket.address&&source.socket.address()));
	let bytes_rs = 0, bytes_ws = 0, _debug=this._debug;

	source.on('data', (d) => {
	    debugger;
	    bytes_rs += d.length;
	    _debug(`${new Date} transmitting socket data: ${d.length} bytes (total=${bytes_rs}) socket{${addr.address}:${addr.port}}`);
	    
	    if (dest.writable){
		dest.write(d);
	    }
	    else {
		dest.sendBytes(d);
	    }
	});

	//websocket only
	source.on('message', (msg)=> {
	    debugger;
	    bytes_ws += msg.binaryData.length;

	    _debug(`${new Date} transmitting websocket data: ${msg.binaryData.length} bytes (total=${bytes_ws}) websocket{${addr.address}:${addr.port}}`);
	    
	    if (dest.writable){
		dest.write(msg.binaryData);
	    }
	    else {
		dest.sendBytes(msg.binaryData);
	    }
	});

	source.once('error', (err) => {
	    _debug(`${new Date()} connection ${addr.address}:${addr.port} error: ${err}`);
	    this.emit('connect_error', err, source);
	    this.DeleteASession(sid);
	});

	source.once('close', _ => {
	    _debug(`${new Date()} connection ${addr.address}:${addr.port} closed.`);
	    this.emit('connect_close', source);
	    this.DeleteASession(sid);
	});

	source.on('end', _ => {
	    _debug(`${new Date()} socket ended at total ${bytes_rs} bytes for connection ${addr.address}:${addr.port}.`);
	    //this.destroy(sid);
	});
	
    }

    
    pipeTwoWay(a, b, s){
	debugger;
	this.pipe(a, b, s);
	this.pipe(b, a, s);
    }

}

module.exports=RSSession;
