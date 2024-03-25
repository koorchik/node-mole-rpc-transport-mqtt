# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.0] - 2024-03-22

### Added
- support of `inQos` level parameter for both transports: it will be used for subscribing
- support of `outQos` level parameter for both transports: it will be used for publishing
- support of MQTT@5.0 `responseTopic` property: it will be provided to server and selected by default
- `index.js` file to export components

### Changed
- the `outTopic` parameter for `MQTTTransportServer` is not required anymore due to added `responseTopic` support
