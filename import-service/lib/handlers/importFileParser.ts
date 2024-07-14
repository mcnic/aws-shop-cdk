import { APIGatewayProxyResult, S3CreateEvent } from 'aws-lambda';
import { createResponse } from '../helpers/responses';
import csv = require('csv-parser');
import {
  getReadableStreamFromBucketFile,
  moveFileBetweenBucketFolders,
} from '../helpers/bucket';
import { pipeline } from 'stream/promises';
import { config } from '../config';
import { sendSQSMessage } from '../helpers/sqs';

export const handler = async function (
  event: S3CreateEvent
): Promise<APIGatewayProxyResult> {
  const queueUrl = process.env.QUEUE_URL ?? '';

  for (let record of event.Records) {
    const {
      bucket: { name },
      object: { key },
    } = record.s3;

    console.log({ name, key, queueUrl });

    try {
      const readableStream = await getReadableStreamFromBucketFile(name, key);
      const results: any[] = [];
      const parseStream = csv().on('data', (data) => results.push(data));

      await pipeline(readableStream, parseStream);

      await sendSQSMessage(queueUrl, JSON.stringify(results));

      console.log('result sended');

      const destKey = key.replace(
        `${config.uploadPath}/`,
        `${config.parsedPath}/`
      );
      await moveFileBetweenBucketFolders(name, key, destKey);
    } catch (error) {
      console.error(error);
    }
  }

  return createResponse('ok');
};
