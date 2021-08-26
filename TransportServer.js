const convertMQTTTopicToRegex = require('./convertMQTTTopicToRegex');

class MQTTTransportServer {
    constructor({ mqttClient, inTopic, outTopic }) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!inTopic) throw new Error('"inTopic" required');
        if (!outTopic) throw new Error('"outTopic" required');

        this.mqttClient = mqttClient;
        this.inTopic = inTopic;
        this.outTopic = outTopic;
        this.inTopicRegExp = convertMQTTTopicToRegex(this.inTopic);
    }

    async onData(callback) {
        await this.mqttClient.subscribe(this.inTopic);

        this.mqttClient.on('message', async (inTopic, requestData) => {
            if (!this.inTopicRegExp.test(inTopic)) {
                return;
            }

            // eslint-disable-next-line callback-return
            const responseData = await callback(requestData.toString());

            if (!responseData) return;

            const outTopic =
                typeof this.outTopic === 'function' ? this.outTopic({ inTopic }) : this.outTopic;

            this.mqttClient.publish(outTopic, responseData);
        });
    }
}

module.exports = MQTTTransportServer;
