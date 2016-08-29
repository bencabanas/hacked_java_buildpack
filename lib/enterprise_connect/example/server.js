var RSServer=require('./../rs-server');
//var http = require('http');

var phs=new RSServer({
    //proxy service. remove _ to activate
    _proxy:{
	host:'proxy-src.research.ge.com',
	port:8080
    },
    
    gatewayHost: 'wss://rsgateway-210046573.run.aws-usw02-pr.ice.predix.io',
    gatewayPort: 443,
    //gatewayHost: 'ws://127.0.0.1',
    //gatewayPort: 9898,
    resourceHost: 'localhost', //no protocol prefix. this's always tcp
    resourcePort: 5432,
    id: 'server2', //Reachback service credential
    secret: '143434', //Presented if requested by gateway. This would be your the secret for the Basic auth
    oauthToken: 'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIzNjliMTg2Yi0wMGYzLTQ3MzUtOGFhMC04YWM5ZTJiNzIwNTMiLCJzdWIiOiI3MjliMjI0My05MzllLTQ3ZGMtOWZhYi01Yjg3N2EzMDc3MTEiLCJzY29wZSI6WyJvcGVuaWQiXSwiY2xpZW50X2lkIjoicHJhc2FkLXNlcnZlcjEiLCJjaWQiOiJwcmFzYWQtc2VydmVyMSIsImF6cCI6InByYXNhZC1zZXJ2ZXIxIiwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwidXNlcl9pZCI6IjcyOWIyMjQzLTkzOWUtNDdkYy05ZmFiLTViODc3YTMwNzcxMSIsIm9yaWdpbiI6InVhYSIsInVzZXJfbmFtZSI6InByYXNhZC11c2VyIiwiZW1haWwiOiJwcmFzYWRhLmFsb2thbUBnZS5jb20iLCJhdXRoX3RpbWUiOjE0NjkwNTI5NDIsInJldl9zaWciOiIzZDgwOGJkOCIsImlhdCI6MTQ2OTA1Mjk0MiwiZXhwIjoxNDY5MDk2MTQyLCJpc3MiOiJodHRwczovL2QxYzZlMjgwLTU2YTYtNGM1ZS1hMGE4LTYyZGFlNjc2Yjg2OC5wcmVkaXgtdWFhLnJ1bi5hd3MtdXN3MDItcHIuaWNlLnByZWRpeC5pby9vYXV0aC90b2tlbiIsInppZCI6ImQxYzZlMjgwLTU2YTYtNGM1ZS1hMGE4LTYyZGFlNjc2Yjg2OCIsImF1ZCI6WyJwcmFzYWQtc2VydmVyMSIsIm9wZW5pZCJdfQ.LIMyXAg2tQiC4KOK3UK3Gjebp1I2uxhu-CTbaADuMFDlcbckBsvaUrAISRkjyazlEnhw0AqZfujKTilHyoW3Wyi6WsWDZRe3Ux6MRRkDkBpltwV6czG-n7UR8JOtxTRZ8erI7OfQ-rJkrkyOGFnAHtqpn8ZaAA8WPscZdHRzs8i4YcEXh1C-jc4SAz7t4pfrZdjsT_lT343Zmc1Qe_WlyJAE1g7BBPaw32XHAV2R6vVy9PNS2xq3QlWzW6e7f0quytjHU93uLxtg9L_TmVUvTNh76uwIyd2SqID5da28sDOMUtYwANfVJbvq7dDC7LEJiUUZUUTe2JCgzvi03LRAAg' //Presented if requested by the gateway. This would be your UAA/OAuth token
});

//mock call to bypass the cf health check.
/*http.createServer((req, res)=>{
    res.writeHead(200);
    res.end();
}).listen(process.env.PORT||0, _=> {
    console.log(`${new Date()} CF healthcheck mockup call.`);
});*/

//command: DEBUG=rs:server node server
