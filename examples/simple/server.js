const MoleServer = require('mole-rpc/MoleServer');
const MQTT = require('async-mqtt');
const uuid = require('uuid');
const MQTTTransportServer = require('../../TransportServer');
const { getSetting } = require('./getSetting');

const instance = uuid.v4();

const mqttHost = getSetting('MQTT_HOST', 'tcp://localhost:1883');
// consider trying '$share/core_group/fromClient/+' for shared topics
const mqttTopic = getSetting('MQTT_TOPIC', 'fromClient/+');

if (!mqttTopic.endsWith('fromClient/+')) {
    console.error('The simple server will not work properly if the topic does not match fromClient/+');
    console.error('Consider using $share/core_group/fromClient/+ as an option');
}

async function main() {
    console.log(`Running as instance ${instance}`);
    const mqttClient = await MQTT.connect(mqttHost);

    const server = new MoleServer({
        transports : [
            new MQTTTransportServer({
                mqttClient,
                inTopic  : mqttTopic,
                outTopic : ({ inTopic }) => inTopic.replace('fromClient', 'toClient')
            })
        ]
    });

    server.expose({
        getGreeting(name) {
            return `Hi, ${name}, from instance ${instance}`;
        }
    });

    await server.run();
}

main(console.log, console.error);
