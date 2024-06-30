import { APIGatewayEvent, S3Event } from 'aws-lambda';
import { createResponse } from '../lib/helpers/responses';
import { queryStringParameters } from '../lib/types';
import { handler as importProductsFileHandler } from '../lib/handlers/importProductsFile';
import { handler as importFileParserHandler } from '../lib/handlers/importFileParser';

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

const s3MockEvent: S3Event & queryStringParameters = {
  queryStringParameters: {
    name: FILE_NAME,
  },
  Records: [
    {
      eventVersion: '',
      eventSource: '',
      awsRegion: '',
      eventTime: '',
      eventName: '',
      userIdentity: {
        principalId: '',
      },
      requestParameters: {
        sourceIPAddress: '',
      },
      responseElements: {
        'x-amz-request-id': '',
        'x-amz-id-2': '',
      },
      s3: {
        s3SchemaVersion: '',
        configurationId: '',
        bucket: {
          name: '',
          ownerIdentity: {
            principalId: '',
          },
          arn: '',
        },
        object: {
          key: 'asasasa',
          size: 0,
          eTag: '',
          sequencer: '',
        },
      },
    },
  ],
};

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: () => `${FILE_NAME}-1`,
  };
});

jest.mock('@aws-sdk/client-s3', () => ({
  getObject: () => {
    return { Body: () => {} };
  },
}));

describe('importProductsFile', () => {
  test('getUrl', async () => {
    const res = await importProductsFileHandler(apiMockEvent);

    expect(res).toEqual(createResponse(`${FILE_NAME}-1`));
  });
});

describe('importFileParser', () => {
  test('getUrl', async () => {
    const res = await importFileParserHandler(s3MockEvent);

    expect(res).toEqual(createResponse(`${FILE_NAME}-1`));
  });
});
