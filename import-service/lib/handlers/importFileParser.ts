import { APIGatewayProxyResult, S3CreateEvent } from 'aws-lambda';
import { createResponse } from '../helpers/responses';
import csv = require('csv-parser');
import {
  getReadableStreamFromBucketFile,
  moveFileBetweenBucketFolders,
} from '../helpers/bucket';
import { pipeline } from 'stream/promises';
import { config } from '../config';

export const handler = async function (
  event: S3CreateEvent
): Promise<APIGatewayProxyResult> {
  for (let record of event.Records) {
    const {
      bucket: { name },
      object: { key },
    } = record.s3;
    console.log({ name, key });

    const readableStream = await getReadableStreamFromBucketFile(name, key);
    const results: any[] = [];
    const parseStream = csv()
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`${key} results`, results);
      });

    await pipeline(readableStream, parseStream);

    const destKey = key.replace(
      `${config.uploadPath}/`,
      `${config.parsedPath}/`
    );
    await moveFileBetweenBucketFolders(name, key, destKey);
  }

  return createResponse('ok');
};
