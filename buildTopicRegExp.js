function buildTopicRegExp(topic) {
    let pattern = cleanSharedPrefixes(topic);

    pattern = escapeRegExpSymbols(pattern)

    // Handle single-level wildcard
    pattern = pattern.replace(/\\\+/g, '[^/]+');

    // Handle multi-level wildcard
    pattern = pattern.replace(/#/g, '.*');

    return new RegExp('^' + pattern + '$');
}

function cleanSharedPrefixes(originalTopic) {
    let topic = originalTopic;
    let leadingSlash = false;

    // Handle leading slashes
    if (topic.startsWith('/')) {
        topic = topic.substring(1);
        leadingSlash = true;
    }

    // Cleanup shared subscription prefixes
    if (topic.startsWith('$share/')) {
        topic = topic.substring('$share/'.length);

        const shareGroupEndIdx = topic.indexOf('/');

        topic = topic.substring(shareGroupEndIdx + 1);
    } else if (topic.startsWith('$queue/')) {
        topic = topic.substring('$queue/'.length);
    }

    // Return leading slash
    if (leadingSlash) {
        topic = `/${topic}`;
    }

    return topic;
}

function escapeRegExpSymbols(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = buildTopicRegExp;