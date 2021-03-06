const AWS = require('aws-sdk');
const { v4: UUID } = require('uuid');
const { listConnections } = require('./controller-connection');

const CONVERTER = AWS.DynamoDB.Converter;

const DB_CONFIG =
  process.env.SERVERLESS_STAGE === 'local'
    ? {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
      }
    : {
        region: process.env.SERVERLESS_REGION || 'eu-west-1',
      };

const { TABLE_NAME_MESSAGE } = process.env || 'Message';

function saveMessage(message) {
  console.log(message);
  const fullMessageObj = { ...message, messageID: UUID() };
  const params = {
    TableName: TABLE_NAME_MESSAGE,
    Item: fullMessageObj,
  };

  const dynamodb = new AWS.DynamoDB.DocumentClient(DB_CONFIG);

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  return dynamodb
    .put(params)
    .promise()
    .then(() => {
      console.info('Message added');
      return fullMessageObj;
    });
}

function getOtherConnections(connectionID) {
  const filter = {
    ScanFilter: {
      connectionID: {
        ComparisonOperator: 'NE',
        AttributeValueList: [connectionID],
      },
    },
  };
  return listConnections(filter);
}

function sendMessage(messageData) {
  const { endpoint, connectionID, dataObj } = messageData;
  const api = new AWS.ApiGatewayManagementApi({ endpoint });
  console.debug(`Sendind message ${JSON.stringify(messageData)}`);
  return api
    .postToConnection({
      ConnectionId: connectionID,
      Data: JSON.stringify(dataObj),
    })
    .promise()
    .then(() => `Message sent to ${connectionID}`);
}

function processStreamMessage(streamImage) {
  const imageObj = CONVERTER.unmarshall(streamImage);
  const {
    connectionID: senderConnectionID,
    message,
    displayName: senderDisplayName,
    endpoint,
  } = imageObj;
  console.debug(`Processing message from ${senderConnectionID}`);
  return getOtherConnections(senderConnectionID).then((connectionIDs = []) =>
    Promise.allSettled(
      connectionIDs.map((connectionID) =>
        sendMessage({ endpoint, connectionID, dataObj: { senderDisplayName, message } })
      )
    ).then((results) =>
      results
        .filter((result) => {
          const { status, reason } = result;
          if (status === 'rejected') {
            console.error(reason);
          }
          return status === 'fulfilled';
        })
        .map((result) => {
          const { value } = result;
          return value;
        })
    )
  );
}

function processStream(event) {
  console.time('message-stream');
  const { Records = [] } = event;

  console.debug(`Processing stream: ${JSON.stringify(Records)}`);

  return Promise.allSettled(
    Records.map((record) => {
      const { eventName, dynamodb: { NewImage: image } = {} } = record;
      if (image && eventName === 'INSERT') {
        return processStreamMessage(image);
      }
      return Promise.resolve(eventName);
    })
  ).then((results) => {
    console.info(`Stream processed: ${JSON.stringify(results)}`);
    console.timeEnd('message-stream');
  });
}

module.exports = {
  saveMessage,
  processStream,
};
