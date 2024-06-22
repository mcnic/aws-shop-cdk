import {
  DynamoDBClient,
  QueryCommand,
  QueryInput,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async function (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log({
    request: JSON.stringify(event, undefined, 2),
    params: event.pathParameters,
  });

  const command = new ScanCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
  });

  try {
    const response = await docClient.send(command);
    console.log({ response });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify(response.Items),
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
