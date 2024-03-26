const { QOS_LEVELS } = require('./constants');
const buildTopicRegExp = require('./buildTopicRegExp');

class MQTTTransportServer {
    constructor({
        mqttClient,
        inTopic,
        outTopic,
        inQos = QOS_LEVELS.AT_MOST_ONCE,
        outQos = QOS_LEVELS.AT_MOST_ONCE
    }) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!inTopic) throw new Error('"inTopic" required');

        this.mqttClient = mqttClient;
        this.inTopic = inTopic;
        this.outTopic = outTopic;
        this.inQos = inQos;
        this.outQos = outQos;
    }

    async onData(callback) {
        await this.mqttClient.subscribe(this.inTopic, { qos: this.inQos });

        const inTopicRegExp = buildTopicRegExp(this.inTopic);

        this.mqttClient.on('message', async (topic, messageBuffer, packet) => {
            if (!inTopicRegExp.test(topic)) {
                return;
            }

            const responseData = await callback(messageBuffer.toString());

            if (!responseData) {
                return;
            }

            let outTopic;

            if (packet.properties && packet.properties.responseTopic) {
                // Supported only by MQTT 5.0
                outTopic = packet.properties.responseTopic;
            } else if (typeof this.outTopic === 'function') {
                outTopic = this.outTopic({ inTopic });
            } else {
                outTopic = this.outTopic;
            }

            if (!outTopic) {
                throw new Error('"outTopic" is not specified');
            }

            await this.mqttClient.publish(outTopic, responseData, { qos: this.outQos });
        });
    }
}

module.exports = MQTTTransportServer;
