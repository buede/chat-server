const { expect } = require('chai');
const { request: handler } = require('../src/handler/handler-status');

let event;

beforeEach(() => {
  // eslint-disable-next-line global-require
  event = require('./event.json');
});

describe('Status test', () => {
  it('Return basic message', (done) => {
    event.httpMethod = 'GET';
    event.resource = '/status';
    handler(event)
      .then((response) => {
        const { statusCode } = response;
        expect(statusCode).to.equal(200);
        done();
      })
      .catch((error) => done(error));
  });

  it('Unknown path', (done) => {
    const expectedStatusCode = 404;
    event.httpMethod = 'GET';
    event.resource = '/status/test';
    handler(event)
      .then((response) => {
        const { statusCode } = response;
        expect(statusCode).to.equal(expectedStatusCode);
        done();
      })
      .catch((error) => done(error));
  });
});
