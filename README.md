MQTT Transport for Mole RPC (JSON RPC Library)
---------------------------------------------

[![npm version](https://badge.fury.io/js/mole-rpc-transport-mqtt.svg)](https://badge.fury.io/js/mole-rpc-transport-mqtt)
[![Build Status](https://travis-ci.org/koorchik/node-mole-rpc-transport-mqtt.svg?branch=master)](https://travis-ci.org/koorchik/node-mole-rpc-transport-mqtt)
[![Known Vulnerabilities](https://snyk.io/test/github/koorchik/node-mole-rpc-transport-mqtt/badge.svg?targetFile=package.json)](https://snyk.io/test/github/koorchik/node-mole-rpc-transport-mqtt?targetFile=package.json)


Mole-RPC is a tiny transport agnostic JSON-RPC 2.0 client and server which can work both in NodeJs, Browser, Electron etc.

This is MQTT based tranport but there are [many more transports](https://www.npmjs.com/search?q=keywords:mole-transport).


**What is the reason of using MQTT for JSON-RPC?**

MQTT is a standard broker in IoT world. It is lightweight and fast message broker and the same time it contains a lot of advanced features like (persistence, retained messaged, QoS, ACL etc).

You can organize many to many RPC-connunication between microservices via MQTT.

*For example, in our case, we use this module to connect microservices deployed to an IoT Hub*

**Which MQTT server to use?**

You can use anyone you wish. As for us, we use in production:

1. [Eclipse Mosquitto](https://mosquitto.org/). Very lightweight but works greatly.
2. [EMQ X](https://www.emqx.io/). More powerful if you need more features.

The easiest way to start playing is to run mosquitto in docker:

```sh
docker run -it -p 1883:1883 eclipse-mosquitto
```

After that you can try the example below.

## Usage Example

```javascript
const MoleClient = require('mole-rpc/MoleClient');
const MoleServer = require('mole-rpc/MoleServer');
const MQTTTransportClient = require('mole-rpc-transport-mqtt/TransportClient');
const MQTTTransportServer = require('mole-rpc-transport-mqtt/TransportServer');

const MQTT = require("async-mqtt");

async function main() {
  await runServer();
  await runClients();
}

async function runServer() {
  const mqttClient = MQTT.connect("tcp://localhost:1883");

  const server = new MoleServer({
    transports: [
      new MQTTTransportServer({
        mqttClient,
        inTopic: 'fromClient/+',
        outTopic: ({inTopic}) => inTopic.replace('fromClient', 'toClient')
      })
    ],
  });

  server.expose({
    getGreeting(name) {
      return `Hi, ${name}`;
    }
  });

  await server.run();
}


async function runClients() {
    const mqttClient = MQTT.connect("tcp://localhost:1883");

    const client1 = new MoleClient({
      transport: new MQTTTransportClient({
        mqttClient,
        inTopic: 'toClient/1',
        outTopic: 'fromClient/1'
      }),
    });

    const client2 = new MoleClient({
      transport: new MQTTTransportClient({
        mqttClient,
        inTopic: 'toClient/2',
        outTopic: 'fromClient/2'
      }),
    });

    console.log(
      'CLIENT 1',
      await client1.callMethod('getGreeting', ['User1'])
    );

    console.log(
      'CLIENT 2',
      await client2.callMethod('getGreeting', ['User2'])
    );
}

main(console.log, console.error);
```

## How does it work?

MQTT has topics. \
Different services can subscribe to different topic. \
You can use wildcard characters in names like `+` or `#`.

**MQTTTransportClient** has two topic related parameters:

* `outTopic` - sends request to this topic.
* `inTopic`  - gets response in this topic.


**MQTTTransportServer** has two topic related parameters:

* `inTopic`  - listend to requests from client in this topic. \
  If you have many clients it makes sense use wildcard topic.
* `outTopic` - sends response to this topic. \
  You can pass callback which will convert in topic to outtopic.

Also, both **MQTTTransportClient** and **MQTTTransportServer** support `inQos` and `outQos` parameters \
to control the [quality of service](https://en.wikipedia.org/wiki/MQTT#Quality_of_service).

## How to use topics in the scalable way

### If you use MQTT version 5 or higher

MQTT version 5 supports the `responseTopic` property in-built to the protocol.

The **MQTTTransportClient** will automatically pass it to server, therefore \
you can omit specifing `outTopic` for **MQTTTransportServer** in this case.

### If you use MQTT version 4 or lower

One of the pattern can be the following:

* Send data to:  `/rpc/${FROM}/${TO}`
* Get data from: `/rpc/${TO}/${FROM}`

*See "Usage Example" for a simpler approach*

#### Many RPC clients and one RPC Server.

Let's assume that is an authentication server

**Server:**

```js
const inTopic = '/rpc/+/auth-server';
const outTopic = inTopicToOutTopic;

function inTopicToOutTopic({ inTopic }) {
    const [ namespace, from, to ] = inTopic.split('/');
    const outTopic = `/${namespace}/${to}/${from}`;
    return outTopic;
}
```

**Client**

```js
const clientId = 'client123'; // you can use UUID for automatic id generation.
const inTopic = `/rpc/auth-server/${clientId}`;
const outTopic = `/rpc/${clientId}/auth-server`
```

So, for each clients connection to server you will have a pair of topics. \
It looks a little bit more complicated but allows easely switch to many-to-many connection apprach.

#### Many-to-many connections

For this case, you can use the same approach as for "Many RPC clients and one RPC Server" case.

1. You run every service as an Mole RPC server.
2. You use instantiate Mole RPC clients with corresponding topics.

You can notive that if SERVICE_A talks to SEVICE_B we need 2 topics. \
But when SERVICE_B talks to SERVICE_A we will use the same topic names and that is ok. \
This transport handles this situation, so you can use understandable topics which always follow this pattern:

* Always send data to:  `/rpc/${FROM}/${TO}`
* Always get data from: `/rpc/${TO}/${FROM}`

This is the approach we use for many-to-many communication approach but you can use other approaces. \
For example, if you want to allow SERVICE_A to get request only from SERVICE_B, \
you can use inTopic name without wildcard - `/rpc/SERVICE_B/SERVICE_A` \
(outTopic can be set to static value `/rpc/SERVICE_A/SERVICE_B` as well ).