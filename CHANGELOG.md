# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.0] - 2024-03-26

### Added
- matching of subscription topic for `MQTTTransportServer` to handle overlapping issues

### Changed
- matching of subscription topic in `MQTTTransportClient` to handle wildcards

### Removed
- topic leading slash from examples because it is considered as a [bad practice](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/).


## [1.1.0] - 2024-03-22

### Added
- support of `inQos` level parameter for both transports: it will be used for subscribing
- support of `outQos` level parameter for both transports: it will be used for publishing
- support of MQTT@5.0 `responseTopic` property: it will be provided to server and selected by default
- `index.js` file to export components
- node `18` version for the Travis check

### Changed
- the `outTopic` parameter for `MQTTTransportServer` is not required anymore due to added `responseTopic` support
