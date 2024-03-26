const assert = require('node:assert');
const buildTopicRegExp = require('../buildTopicRegExp');

assertMatches('rpc/one/two', 'rpc/one/two');
assertMatches('rpc/one/two', '$queue/rpc/one/two');
assertMatches('rpc/one/two', '$share/group/rpc/one/two');

// Topics with a leading slash is a bad practice, but test them as well
assertMatches('/rpc/one/two', '/rpc/one/two');
assertMatches('/rpc/one/two', '/$queue/rpc/one/two');
assertMatches('/rpc/one/two', '/$share/group/rpc/one/two');

assertMatches('rpc/one/two', 'rpc/+/two');
assertMatches('rpc/one/two', 'rpc/+/+');
assertMatches('rpc/one/two', 'rpc/#');
assertMatches('rpc/one/two', 'rpc/one/#');
assertMatches('rpc/one/two', 'rpc/+/#');

assertNotMatches('rpc/one/four', 'rpc/one/two');
assertNotMatches('rpc/one/four', 'rpc/+/two');
assertNotMatches('rpc/one/four', 'rpc/+/two');
assertNotMatches('rpc/three/four', 'rpc/one/#');


function assertMatches(receivedTopic, subscriptionTopic) {
    console.log(`Test topic [${receivedTopic}] matches to [${subscriptionTopic}]`);

    const regExp = buildTopicRegExp(subscriptionTopic);

    assert.equal(regExp.test(receivedTopic), true);
}

function assertNotMatches(receivedTopic, subscriptionTopic) {
    console.log(`Test topic [${receivedTopic}] NOT matches to [${subscriptionTopic}]`);

    const regExp = buildTopicRegExp(subscriptionTopic);

    assert.equal(regExp.test(receivedTopic), false);
}
