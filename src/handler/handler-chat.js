const { processRequest } = require('./handler');
const { addConnection, removeConnection } = require('../controller/controller-connection');
const { saveMessage } = require('../controller/controller-message');

function getConnectionId(event) {
  const { requestContext: { connectionId: connectionID } = {} } = event;
  return connectionID;
}

function processConnect(event) {
  console.log(JSON.stringify(event));
  return addConnection(getConnectionId(event));
}

function processDisconnect(event) {
  console.log(JSON.stringify(event));
  return removeConnection(getConnectionId(event));
}

function processSendMessage(event) {
  const {
    body: bodyStr,
    requestContext: { connectionId: connectionID, domainName, stage } = {},
  } = event;
  const { message, displayName = 'anonymous' } = JSON.parse(bodyStr);
  const endpoint =
    domainName === 'localhost' ? 'http://localhost:3001' : `https://${domainName}/${stage}`;
  return saveMessage({ connectionID, message, displayName, endpoint });
}

// Map your functions to http events here
const RESOURCE_MAP = {
  WebSocket: {
    $connect: processConnect,
    $disconnect: processDisconnect,
    sendMessage: processSendMessage,
  },
};

exports.request = async (event) => processRequest(event, RESOURCE_MAP);
