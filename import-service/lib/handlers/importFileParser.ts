import { APIGatewayProxyResult, S3CreateEvent } from 'aws-lambda';
import { createJsonResponse, createResponse } from '../helpers/responses';
import csv = require('csv-parser');
import { getBucketFileStream } from '../helpers/bucket';
import { pipeline } from 'stream/promises';

export const handler = async function (
  event: S3CreateEvent
): Promise<APIGatewayProxyResult> {
  const bucketName = process.env.BUCKET_NAME ?? '';
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );
  console.log({
    bucketName,
    key,
  });

  const readableStream = await getBucketFileStream(bucketName, key);
  const results: any[] = [];
  const parseStream = csv()
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('=== results', results);
    });

  await pipeline(readableStream, parseStream);

  return createResponse('ok');
};
