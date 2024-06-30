import { S3Event } from 'aws-lambda';
import { createResponse } from '../lib/helpers/responses';
import { queryStringParameters } from '../lib/types';
import { handler as importFileParserHandler } from '../lib/handlers/importFileParser';
// import { getBucketFileStream } from '../lib/helpers/bucket';
import { createReadStream } from 'fs';

const FILE_NAME = 'filename.csv';

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

// jest.mock('@aws-sdk/client-s3');

// jest.mock('@aws-sdk/client-s3', () => ({
//   constructor: ()=>{},
//   getObject: () => {
//     return { Body: () => {} };
//   },
// }));

// jest.mock('./getBucketFileStream', () => {
//   return createReadStream('./mock.csv');
// });

jest.mock('../lib/helpers/bucket', () => {
  const originalModule = jest.requireActual<
    typeof import('../lib/helpers/bucket')
  >('../lib/helpers/bucket');

  return {
    __esModule: true,
    ...originalModule,
    getBucketFileStream: () => {
      return createReadStream('./mock.csv');
    },
  };
});

describe('importFileParser', () => {
  afterAll(() => {
    jest.unmock('../lib/helpers/bucket');
  });

  test('parse csv file', async () => {
    const res = await importFileParserHandler(s3MockEvent);
    console.log('=== importFileParser res', res);


    expect(res).toEqual(createResponse('ok'));
  });
});
