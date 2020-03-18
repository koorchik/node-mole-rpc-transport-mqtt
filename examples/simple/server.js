const MoleServer = require('mole-rpc/MoleServer');
const MQTTTransportServer = require('../../TransportServer');

const MQTT = require("async-mqtt");

async function main() {
    const mqttClient = MQTT.connect("tcp://localhost:1883");

    const server = new MoleServer({
        transports: [
            new MQTTTransportServer({
                mqttClient,
                inTopic: 'fromClient/+',
                outTopic: ({ inTopic }) => inTopic.replace('fromClient', 'toClient')
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

main(console.log, console.error);