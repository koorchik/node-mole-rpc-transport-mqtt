const MoleClient = require('mole-rpc/MoleClient');
const MQTT = require('async-mqtt');
const MQTTTransportClient = require('../../TransportClient');
const { getSetting } = require('./getSetting');

const mqttHost = getSetting('MQTT_HOST', 'tcp://localhost:1883');

async function main() {
    await runClients();
}

async function runClients() {
    const mqttClient = MQTT.connect(mqttHost);

    const client1 = new MoleClient({
        transport : new MQTTTransportClient({
            mqttClient,
            inTopic  : 'toClient/1',
            outTopic : 'fromClient/1'
        })
    });

    const client2 = new MoleClient({
        transport : new MQTTTransportClient({
            mqttClient,
            inTopic  : 'toClient/2',
            outTopic : 'fromClient/2'
        })
    });

    console.log(
        'CLIENT 1',
        await client1.callMethod('getGreeting', [ 'User1' ])
    );

    console.log(
        'CLIENT 2',
        await client2.callMethod('getGreeting', [ 'User2' ])
    );
}

main(console.log, console.error);
