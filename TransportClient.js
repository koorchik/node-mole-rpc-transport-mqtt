const { QOS_LEVELS } = require('./constants');
const buildTopicRegExp = require('./buildTopicRegExp');

class MQTTTransportClient {
    constructor({
        mqttClient,
        inTopic,
        outTopic,
        inQos = QOS_LEVELS.AT_MOST_ONCE,
        outQos = QOS_LEVELS.AT_MOST_ONCE
    }) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!inTopic) throw new Error('"inTopic" required');
        if (!outTopic) throw new Error('"outTopic" required');

        this.mqttClient = mqttClient;
        this.inTopic = inTopic;
        this.outTopic = outTopic;
        this.inQos = inQos;
        this.outQos = outQos;
    }

    async onData(callback) {
        await this.mqttClient.subscribe(this.inTopic, { qos: this.inQos });

        const inTopicRegExp = buildTopicRegExp(this.inTopic);

        this.mqttClient.on('message', (topic, data) => {
            if (!inTopicRegExp.test(topic)) {
                return;
            }

            callback(data.toString());
        });
    }

    async sendData(data) {
        await this.mqttClient.publish(this.outTopic, data, {
            qos: this.outQos,
            properties: {
                responseTopic: this.inTopic
            }
        });
    }
}

module.exports = MQTTTransportClient;
