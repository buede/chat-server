const { processStream } = require('../controller/controller-message');

exports.request = (event) => processStream(event);
