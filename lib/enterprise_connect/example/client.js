var RSClient=require('./../rs-client');

var phs=new RSClient({
    //proxy service. remove _ to activate
    _proxy:{
	host:'proxy-src.research.ge.com',
	port:8080
    },
    localPort:7989,
    //gatewayHost:'ws://localhost',
    //gatewayPort:9898,
    gatewayHost: 'wss://rsgateway-210046573.run.aws-usw02-pr.ice.predix.io',
    gatewayPort: 443,
    targetServerId:'server2',//empty/id/ip
    id: 'client2',
    secret: '1234', //Presented if requested by gateway. This would be your the secret for the Basic auth
    oauthToken: 'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJhZjY5MjNjYi0yMTQ4LTQ0NTktYjM0Ni0xMDM1OWQ4MzhhZjIiLCJzdWIiOiI3MjliMjI0My05MzllLTQ3ZGMtOWZhYi01Yjg3N2EzMDc3MTEiLCJzY29wZSI6WyJvcGVuaWQiXSwiY2xpZW50X2lkIjoicHJhc2FkLWNsaWVudDEiLCJjaWQiOiJwcmFzYWQtY2xpZW50MSIsImF6cCI6InByYXNhZC1jbGllbnQxIiwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwidXNlcl9pZCI6IjcyOWIyMjQzLTkzOWUtNDdkYy05ZmFiLTViODc3YTMwNzcxMSIsIm9yaWdpbiI6InVhYSIsInVzZXJfbmFtZSI6InByYXNhZC11c2VyIiwiZW1haWwiOiJwcmFzYWRhLmFsb2thbUBnZS5jb20iLCJhdXRoX3RpbWUiOjE0Njg1NjQwNjEsInJldl9zaWciOiI0NzZlMTI4IiwiaWF0IjoxNDY4NTY0MDYxLCJleHAiOjE0Njg2MDcyNjEsImlzcyI6Imh0dHBzOi8vZDFjNmUyODAtNTZhNi00YzVlLWEwYTgtNjJkYWU2NzZiODY4LnByZWRpeC11YWEucnVuLmF3cy11c3cwMi1wci5pY2UucHJlZGl4LmlvL29hdXRoL3Rva2VuIiwiemlkIjoiZDFjNmUyODAtNTZhNi00YzVlLWEwYTgtNjJkYWU2NzZiODY4IiwiYXVkIjpbInByYXNhZC1jbGllbnQxIiwib3BlbmlkIl19.rOZKXC7d82ebZm9GNNcs35ESpmTNKxBrwvjkT4zGLMIUk31yJwfBI6GW83B_nQMK5nRejKxafSgUM4COZSi200nEs-98N9X1QJkKbQ4tnK_dhzlL10D6hDY6A1Hc1faXqLTkcjBI5YsCrJQu71S3Z1rDt2fPlBmCVYRls5M4PYTPJypifLJQ0463d816F3RzuT1SZ2B5BBtDXku17KGVKbwxLpJOI8LNOQhvGjkaNxcoQRUAxFIlBRyElhN9diF-Iq3Jnx23FOHVnJstd1E1jr9c8uWh1uPD8K-D7cLriBT4BYvwzB_22dtFqSHl72n-5l-Y9ZkA9YzRj-1IIRhzrQ' //Presented if requested by gateway. This would be your UAA/OAuth token
});

//mock call to bypass the cf health check.
http.createServer((req, res)=>{
    res.writeHead(200);
    res.end();
}).listen(process.env.PORT||0, _=> {
    console.log(`${new Date()} CF healthcheck mockup call.`);
});

//command: DEBUG=rs:client node client
