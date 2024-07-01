import { S3CreateEvent } from 'aws-lambda';
import { createResponse } from '../lib/helpers/responses';
import { handler as importFileParserHandler } from '../lib/handlers/importFileParser';
import { createReadStream, ReadStream } from 'fs';
import { join as pathJoin } from 'node:path';
import * as bucketApi from '../lib/helpers/bucket';
import { Readable } from 'node:stream';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { sdkStreamMixin } from '@smithy/util-stream';

const s3MockEvent = {
  Records: [
    {
      s3: {
        bucket: {
          name: 'my-backet',
        },
        object: {
          key: 'file.csv',
        },
      },
    },
  ],
} as S3CreateEvent;

const s3Mock = mockClient(S3Client);

describe('importFileParser', () => {
  beforeAll(() => {
    const mockFile = pathJoin(process.cwd(), 'test/mock.csv');
    // bellow are 3 mock variants, working all
    
    // jest
    //   .spyOn(bucketApi, 'getBucketFileStream')
    //   .mockReturnValue(Promise.resolve(createReadStream(mockFile) as Readable));
    // .mockImplementation((_bucket: string, _key: string) =>
    //   Promise.resolve(createReadStream(mockFile) as Readable)
    // );

    s3Mock.on(GetObjectCommand).resolves({ Body: sdkStreamMixin(createReadStream(mockFile)) });
  });

  test('parse csv file', async () => {
    const res = await importFileParserHandler(s3MockEvent);

    expect(res).toEqual(createResponse('ok'));
  });
});
