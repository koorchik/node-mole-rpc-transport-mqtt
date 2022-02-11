/**
 * This is the shared prefix name specified by the MQTT spec. When you
 * subscribe to a topic, if you follow the format $share/group_name/topic_name,
 * the messages will be dispersed to ONE consumer subscribed to that topic_name,
 * and the incoming topic name will be "topic_name".
 * @type {string}
 */
const sharedPrefix = '$share/';

function convertMQTTTopicToRegex(topic) {
    let strippedTopic = topic;

    if (strippedTopic.startsWith(sharedPrefix)) {
        let mangledTopic = strippedTopic.slice(sharedPrefix.length);
        // do we have a group? It'll be shown here.
        const indexOfTopic = mangledTopic.indexOf('/');

        if (indexOfTopic > 0) {
            mangledTopic = mangledTopic.slice(indexOfTopic + 1);
        }

        strippedTopic = mangledTopic;
    }

    const convertedTopic = strippedTopic
        .replace('+', '[^/]+')
        .replace('#', '/.+');

    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(convertedTopic);
}

module.exports = convertMQTTTopicToRegex;
