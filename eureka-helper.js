const express = require('express');
const app = express();
const axios = require('axios')

const Eureka = require('eureka-js-client').Eureka;
const eurekaHost = (process.env.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE || '127.0.0.1');
const eurekaPort = 8761;
const hostName = (process.env.HOSTNAME || 'localhost')
const ipAddr = '172.0.0.1';
let javaInstance= '';

exports.registerWithEureka = function(appName, PORT) {
    const client = new Eureka({
      // requestMiddleware: (requestOpts, done) => {
      //   requestOpts.auth = {
      //     user: 'username',
      //     password: 'somepassword'
      //   };
      //   done(requestOpts);
      // },
    instance: {
      app: appName,
      hostName: hostName,
      ipAddr: ipAddr,
      port: {
        '$': PORT,
        '@enabled': 'true',
      },
      vipAddress: appName,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    //retry 10 time for 3 minute 20 seconds.
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: '/eureka/apps/',
      maxRetries: 10,
      requestRetryDelay: 2000,
    },
  })

client.logger.level('debug')

client.start( error => {
    console.log(error || "user service registered")
    javaInstance = client.getInstancesByAppId('Gestion');
    const javaUrl = `${javaInstance[0].hostName}:${
      javaInstance[0].port.$
    }/${javaInstance[0].app}/get_Agents`;

    // const javatest= client.getInstancesByVipAddress('Gestion/get_Agents')
    // console.log(javatest);
    
    app.get('/serviceInfo/${javaUrl}', (req, res) => {
      console.log('hehe');
      res.send(JSON.stringify(javaInstance), null, 2);
      console.log(res);
      res.end();
    });
});

app.get('/api/B', (req, res) => {
  axios.get('http://Gestion/get_Agents', {
    params: {...req.query, name: 'Device A'}, //Fetch datas from params
  }).then(result => {
    res.send(result)
  })
})

function exitHandler(options, exitCode) {
    if (options.cleanup) {
    }
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) {
        client.stop();
    }
}

client.on('deregistered', () => {
    process.exit();
    console.log('after deregistered');
})

client.on('started', () => {
  console.log("eureka host  " + eurekaHost);
})


process.on('SIGINT', exitHandler.bind(null, {exit:true}));
};