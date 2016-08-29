/*
 * author: chia.chang@ge.com
 */

'use strict';

const RSCommon = require('./common');

class RSAuth extends RSCommon {

    constructor(options){

	super();

	this.debug('rs:auth')

	//obj to map conversion
	options.groups=this.obj2Map(options.groups);
	
	//gateway side configuration
	this._options=options;

	this._usageValidation=(c)=>{
	    
	    switch (c.clientType){
	    case "client":
		return this._options.clients[c.id].auth;
	    case "server":
	    case "admin":
		return this._options.servers[c.id].auth;
	    default:
		return false;
	    }
	}
	
	this._groupValidation=(c)=>{

	    debugger;
	    
	    for (var [key, val] of this._options.groups) {
		
		if (val.indexOf(c.id)!=-1&&val.indexOf(c.targetServerId)!=-1){
		    return true;
		}
	    }

	    return false;

	}

	//c: client conf, a: auth settings in gateway
	this._basicValidation=(c,a)=>{

	    if (c.secret==a.secret)
		return true;

	    return false;
	}

	//c: client conf, a: auth settings in gateway
	this._oAuthTokenValidation=(c, a)=>{
	    
	    return new Promise((reso,reje)=>{
		
		let _buf=new Buffer(`${a.clientId}:${a.clientSecret}`);

		let _op={
		    method: 'post',
		    url: a.authUrl+'/check_token',
		    headers: {
			'Authorization': 'Basic ' + _buf.toString('base64'),
			'Content-Type': 'application/x-www-form-urlencoded'
		    },
		    form: {
			'token':c.oauthToken
		    }
		};
		
		this._request(_op,(err,res,body)=>{
		    let _ref=JSON.parse(body);
		    if (_ref.error){
			return reje(_ref);
		    }

		    this._debug(`${new Date()} oauth user: ${_ref.user_name} with email: ${_ref.email} has been authenticated by oauth client: ${_ref.client_id}.`);

		    return reso(_ref);
		});	    
	    });	
	}
    }

    //config from client/server

    /*
     * clientType: "auth/oauth2/basic/plain"
     * id
     * secret
     * autoToken
     */
    validate(conf){
	return new Promise((reso,reje)=>{
	    let _co=conf;

	    let _op=this._usageValidation(conf);

	    if (!_op)
		return reje(`connection from ${conf.id} rejected due to the unknown client.`);

	    if (_co.clientType=='client'&&!this._groupValidation(conf)){
		return reje(`connection from ${conf.id} rejected due to the invalid group.`);
	    }

	    switch (_op.type){
	    case "oauth2":
	    case "oauth":    
		return this._oAuthTokenValidation(conf, _op).then(body=>{
		    return reso(body);
		}).catch(err=>{
		    return reje(err);
		});
	    case "basic":
	    case "plain":
		if (!this._basicValidation(conf,_op))
		    return reje(`connection from ${conf.id} rejected due to the invalid credential.`);
		
		return reso(true);
		
	    default:
		return reje(false);
	    }
	});	
    }

}

module.exports=RSAuth;
