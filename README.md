# chat-server
Chat server using AWS API Gateway with WebSockets.

## Requirements
* [Node.js 12.x](https://nodejs.org/)

## Installation
1. Install the dependencies with `npm i`

## Managing the API
### Running locally
To start the API in your machine simply run `npm start`, this will deploy the API locally using the serverless offline module.

### Deploy stage
* To dev: `npm run deploy-dev`
* To test: `npm run deploy-test`
* To prod: `npm run deploy-prod`

*Alternatively:* `serverless deploy --stage <stage>`

### Remove stage
* From dev: `npm run remove-dev`
* From test: `npm run remove-test`
* From prod: `npm run remove-prod`

*Alternatively:* `serverless remove --stage <stage>`

## Testing
To invoke the unit tests located in `/test` simply run `npm test`.