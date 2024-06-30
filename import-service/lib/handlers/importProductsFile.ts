import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createJsonResponse, createResponse } from '../helpers/responses';
import { getUrl } from '../helpers/bucket';

type queryStringParameters = { queryStringParameters: { name: string } };

export const handler = async function (
  event: APIGatewayProxyEvent & queryStringParameters
): Promise<APIGatewayProxyResult> {
  const bucketName = process.env.BUCKET_NAME ?? '';

  console.log({
    params: event.queryStringParameters,
    bucketName,
  });

  try {
    const { name } = event.queryStringParameters;
    const url = await getUrl(bucketName, `uploaded/${name}`);

    return createResponse(url);
  } catch (dbError) {
    return createJsonResponse(dbError, 500);
  }
};
