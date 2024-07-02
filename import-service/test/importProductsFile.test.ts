import { APIGatewayEvent } from 'aws-lambda';
import { createResponse } from '../lib/helpers/responses';
import { queryStringParameters } from '../lib/types';
import { handler as importProductsFileHandler } from '../lib/handlers/importProductsFile';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const FILE_NAME = 'filename.csv';
const apiMockEvent = {
  queryStringParameters: {
    name: FILE_NAME,
  },
} as APIGatewayEvent & queryStringParameters;

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
