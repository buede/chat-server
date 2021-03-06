const AWS = require('aws-sdk');

const DB_CONFIG =
  process.env.SERVERLESS_STAGE === 'local'
    ? {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
      }
    : {
        region: process.env.SERVERLESS_REGION || 'eu-west-1',
      };

const { TABLE_NAME_CONNECTION } = process.env || 'Connection';

function addConnection(connectionID) {
  const params = {
    TableName: TABLE_NAME_CONNECTION,
    Item: { connectionID },
  };

  const dynamodb = new AWS.DynamoDB.DocumentClient(DB_CONFIG);

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  return dynamodb
    .put(params)
    .promise()
    .then(() => {
      console.info('Connection added');
      return connectionID;
    });
}

function removeConnection(connectionID) {
  const params = {
    TableName: TABLE_NAME_CONNECTION,
    Key: {
      connectionID,
    },
  };
  const dynamodb = new AWS.DynamoDB.DocumentClient(DB_CONFIG);

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#delete-property
  return dynamodb
    .delete(params)
    .promise()
    .then(() => {
      console.info('Connection removed');
    });
}

function listConnections(filter = {}) {
  const params = { TableName: TABLE_NAME_CONNECTION, ...filter };

  const dynamodb = new AWS.DynamoDB.DocumentClient(DB_CONFIG);

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
  return dynamodb
    .scan(params)
    .promise()
    .then((data) => {
      const { Items = [] } = data;
      console.info('All connections retrieved');
      console.debug(JSON.stringify(Items));
      return Items.map((item) => {
        const { connectionID } = item;
        return connectionID;
      });
    });
}

module.exports = {
  addConnection,
  listConnections,
  removeConnection,
};
