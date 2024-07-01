import { S3Event } from 'aws-lambda';
import { createResponse } from '../lib/helpers/responses';
import { handler as importFileParserHandler } from '../lib/handlers/importFileParser';
import { createReadStream } from 'fs';
import { join as pathJoin } from 'node:path';
import * as bucketApi from '../lib/helpers/bucket';
import { Readable } from 'node:stream';

const s3MockEvent: S3Event = {
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
          key: 'file.csv',
          size: 0,
          eTag: '',
          sequencer: '',
        },
      },
    },
  ],
};

describe('importFileParser', () => {
  beforeEach(() => {
    const mockFile = pathJoin(process.cwd(), 'test/mock.csv');
    jest
      .spyOn(bucketApi, 'getBucketFileStream')
      .mockReturnValue(Promise.resolve(createReadStream(mockFile) as Readable))
      // .mockImplementation((_bucket: string, _key: string) =>
      //   Promise.resolve(createReadStream(mockFile) as Readable)
      // );
  });

  test('parse csv file', async () => {
    const res = await importFileParserHandler(s3MockEvent);
    console.log('=== importFileParser res', res);

    expect(res).toEqual(createResponse('ok'));
  });
});
