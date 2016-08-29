/*
 * author: chia.chang@ge.com
 */

'use strict';

const RSCommon = require('./common');
const nip = require('ip');

class RSIPFilter extends RSCommon {

    constructor(options){
	super();
	this._options=options;

    }
    
    isInWhiteList(ip,cid){
	if (nip.isPrivate(ip))
	    return true;
	
	let _ref=this._options.clients[cid]||this._options.servers[cid];

	_ref=_ref.whiteList;
	
	for (var val in _ref) {

	    console.log('val:',_ref[val]);
	    let _cidr=nip.cidrSubnet(_ref[val]);

	    if (_cidr.contains(ip)) {
		return true;
	    }
	}

	return false;

    }

    isInBlockList(ip,cid){
	let _ref=this._options.clients[cid]||this._options.servers[cid];

	return _ref.blockList.indexOf(ip)>-1;

    }
}

module.exports=RSIPFilter;

