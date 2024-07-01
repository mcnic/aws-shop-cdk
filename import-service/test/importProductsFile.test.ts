import { APIGatewayEvent } from 'aws-lambda';
import { createResponse } from '../lib/helpers/responses';
import { queryStringParameters } from '../lib/types';
import { handler as importProductsFileHandler } from '../lib/handlers/importProductsFile';

const FILE_NAME = 'filename.csv';
const apiMockEvent: APIGatewayEvent & queryStringParameters = {
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: '',
  isBase64Encoded: false,
  path: '',
  pathParameters: {},
  queryStringParameters: {
    name: FILE_NAME,
  },
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: '',
    apiId: '',
    authorizer: undefined,
    protocol: '',
    httpMethod: '',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '',
      user: null,
      userAgent: null,
      userArn: null,
    },
    path: '',
    stage: '',
    requestId: '',
    requestTimeEpoch: 0,
    resourceId: '',
    resourcePath: '',
  },
  resource: '',
};

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: () => `${FILE_NAME}-1`,
  };
});

describe('importProductsFile', () => {
  test('getUrl', async () => {
    const res = await importProductsFileHandler(apiMockEvent);

    expect(res).toEqual(createResponse(`${FILE_NAME}-1`));
  });
});
