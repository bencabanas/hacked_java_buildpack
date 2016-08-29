var RSGateway=require('./../rs-gateway');

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
	    //cidr subnetting. ipv4/ipv6 suppported. gateway auto-detect if its a private ip
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
	    //cidr subnetting. ipv4/ipv6 suppported.
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
		type: 'basic',
		secret: '143434'
	    },
	    //cidr subnetting. ipv4/ipv6 suppported.
	    whiteList:[
		"::ffff:10.10.10.50/26",
		"3.10.11.141/28",
		"127.0.0.1/24",
		"10.72.12.0/24"
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
		type: 'basic',//oauth,basic
		secret: '143434'
	    },

	    //cidr subnetting. ipv4/ipv6 suppported.
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
    keepAlive: 60000
});

//command: DEBUG=rs:gateway node gateway
