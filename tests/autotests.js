const MQTT = require('async-mqtt');
const MoleClient = require('mole-rpc/MoleClient');
const MoleClientProxified = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');
const AutoTester = require('mole-rpc/AutoTester');

const TransportClient = require('../TransportClient');
const TransportServer = require('../TransportServer');

const EventEmitter = require('events');

async function main() {
    const emitter = new EventEmitter();

    const server = await prepareServer(emitter);
    const clients = await prepareClients(emitter);

    const autoTester = new AutoTester({
        server,
        simpleClient: clients.simpleClient,
        proxifiedClient: clients.proxifiedClient
    });

    await autoTester.runAllTests();
}

async function prepareServer() {
    const mqttClient = MQTT.connect('tcp://localhost:1883');
    await waitForEvent(mqttClient, 'connect');

    return new MoleServer({
        transports: [
            new TransportServer({
                mqttClient,
                inTopic: 'fromClient/+',
                outTopic: ({ inTopic }) => inTopic.replace('fromClient', 'toClient')
            })
        ]
    });
}

async function prepareClients() {
    const mqttClient = MQTT.connect('tcp://localhost:1883');
    await waitForEvent(mqttClient, 'connect');

    const simpleClient = new MoleClient({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClient({
            mqttClient,
            inTopic: 'toClient/1',
            outTopic: 'fromClient/1'
        })
    });

    const proxifiedClient = new MoleClientProxified({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClient({
            mqttClient,
            inTopic: 'toClient/2',
            outTopic: 'fromClient/2'
        })
    });

    return { simpleClient, proxifiedClient };
}

function waitForEvent(emitter, eventName) {
    return new Promise((resolve, reject) => {
        emitter.on(eventName, resolve);
    });
}

main().then(() => {
    process.exit();
}, console.error);
