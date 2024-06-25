import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async function (
  event: any = {}
): Promise<APIGatewayProxyResult> {
  console.log({
    request: JSON.stringify(event, undefined, 2),
    params: event.pathParameters,
  });

  const command = new GetCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
    Key: {
      id: event.pathParameters.id,
    },
  });

  try {
    const response = await docClient.send(command);
    console.log({response});

    return response.Item
      ? {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
          },
          body: JSON.stringify(response.Item),
        }
      : {
          statusCode: 404,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
          },
          body: 'Product not found',
        };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
