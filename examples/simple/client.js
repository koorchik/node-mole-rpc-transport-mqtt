const MoleClient = require('mole-rpc/MoleClient');
const MQTTTransportClient = require('../../TransportClient');
const MQTT = require("async-mqtt");

async function main() {
    await runClients();
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