var RSGateway=require('./../rs-gateway');
var RSServer=require('./../rs-server');

var phs=new RSGateway({
    localPort:process.env.PORT || 9898,
    _ssl:{
	key:'./cert/rs-key.pem',
	cert:'./cert/rs-cert.pem'
    },
    clients: {
	'client1':{
	    auth:{	
		type: 'oauth',//oauth,basic 
		clientId: 'prasad-client1',
		clientSecret: 'hellopredix',
		authUrl: 'https://d1c6e280-56a6-4c5e-a0a8-62dae676b868.predix-uaa.run.aws-usw02-pr.ice.predix.io'
	    },
		whiteList:[
                "::ffff:10.10.10.50/26",
                "3.10.11.141/28",
                "127.0.0.1/24"
            ],
            //ip address
            blockList:[
                //'::ffff:127.0.0.1',
                '10.10.10.200',
                '10.10.10.205'
            ]
	},
	'client2':{
	    auth:{
		type: 'basic',
		secret: '1234'
	    },
	    whiteList:[
                "::ffff:10.10.10.50/26",
                "3.10.11.141/28",
                "127.0.0.1/24"
            ],
            //ip address
            blockList:[
                //'::ffff:127.0.0.1',
                '10.10.10.200',
                '10.10.10.205'
            ]
	}
    },
    servers: {
	'server1':{
	    auth:{	
		type: 'oauth',//oauth,basic 
		clientId: 'prasad-server1',
		clientSecret: 'hellopredix',
		authUrl: 'https://d1c6e280-56a6-4c5e-a0a8-62dae676b868.predix-uaa.run.aws-usw02-pr.ice.predix.io'
	    },
	     whiteList:[
                "::ffff:10.10.10.50/26",
                "3.10.11.141/28",
                "127.0.0.1/24"
            ],
            //ip address
            blockList:[
                //'::ffff:127.0.0.1',
                '10.10.10.200',
                '10.10.10.205'
            ]
	},
	'server2':{
	    auth:{
		type: 'basic',
		secret: '143434'
	    },
	    whiteList:[
                "::ffff:10.10.10.50/26",
                "3.10.11.141/28",
                "127.0.0.1/24"
            ],
            //ip address
            blockList:[
                //'::ffff:127.0.0.1',
                '10.10.10.200',
                '10.10.10.205'
            ]
	}
    },
    groups: {
	'ge-internal':['192.168.0.100','192.168.0.101'],
	'osaka-network':['192.168.0.102','192.168.0.103','192.168.0.101'],
	'tamakura-wifi':['client2','server2']
    },
    keepAlive:60000, //0 Always
});

phs.on('gateway_listening',function(){

    var op=new RSServer({
	//proxy service. remove _ to activate
	_proxy:{
	    host:'proxy-src.research.ge.com',
	    port:8080
	},
	gatewayHost: 'ws://localhost',
	gatewayPort: process.env.PORT || 9898,
	resourceHost: '10.72.6.143', //no protocol prefix. this's always tcp
	resourcePort: 5432,
	//resourceHost: 'localhost', //no protocol prefix. this's always tcp
	//resourcePort: 21,
	id: 'server2', //Reachback service credential
	secret: '143434', //Presented if requested by gateway. This would be your the secret for the Basic auth
	oauthToken: 'rwerwerr34r34r34r' //Presented if requested by the gateway. This would be your UAA/OAuth token
    });

});
//command: DEBUG=rs:gateway node gateway
