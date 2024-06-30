import { APIGatewayProxyResult, S3Event } from 'aws-lambda';
import { createJsonResponse, createResponse } from '../helpers/responses';
import csv = require('csv-parser');
import { Readable } from 'node:stream';
import { S3 } from '@aws-sdk/client-s3';

type queryStringParameters = { queryStringParameters: { name: string } };
const s3 = new S3();

export const handler = async function (
  event: S3Event & queryStringParameters
): Promise<APIGatewayProxyResult> {
  const bucketName = process.env.BUCKET_NAME ?? '';
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );
  console.log({
    bucketName,
    key,
  });

  const s3object = await s3.getObject({ Bucket: bucketName, Key: key });
  const parser = csv();
  const results: any[] = [];

  return new Promise(() =>
    (s3object.Body as Readable)
      .pipe(parser)
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log('=== results', results);
        return createResponse('ok');
      })
      .on('error', (error: any) => createJsonResponse(error, 500))
  );
};
