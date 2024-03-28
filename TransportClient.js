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
        this.messageHandler = () => {};
    }

    async onData(callback) {
        const inTopicRegExp = buildTopicRegExp(this.inTopic);

        this.messageHandler = (topic, messageBuffer) => {
            if (!inTopicRegExp.test(topic)) {
                return;
            }

            callback(messageBuffer.toString());
        };

        this.mqttClient.on('message', this.messageHandler);

        await this.mqttClient.subscribe(this.inTopic, { qos: this.inQos });
    }

    async sendData(data) {
        await this.mqttClient.publish(this.outTopic, data, {
            qos: this.outQos,
            properties: {
                responseTopic: this.inTopic
            }
        });
    }

    async shutdown() {
        await this.mqttClient.unsubscribe(this.inTopic);

        this.mqttClient.off('message', this.messageHandler);

        this.messageHandler = () => {};
    }
}

module.exports = MQTTTransportClient;
