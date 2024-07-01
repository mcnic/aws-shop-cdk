import { APIGatewayProxyResult, S3Event } from 'aws-lambda';
import { createJsonResponse, createResponse } from '../helpers/responses';
import csv = require('csv-parser');
import { getBucketFileStream } from '../helpers/bucket';

export const handler = async function (
  event: S3Event
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
  const parser = csv();
  const results: any[] = [];

  return new Promise(() =>
    readableStream
      .pipe(parser)
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log('=== results', results);
        return createResponse('ok');
      })
      .on('error', (error: any) => createJsonResponse(error, 500))
  );
};
