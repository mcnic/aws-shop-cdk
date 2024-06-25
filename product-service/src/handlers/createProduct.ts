import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { createJsonResponse, createResponse } from '../helpers/responses';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async function (
  event: any = {}
): Promise<APIGatewayProxyResult> {
  console.log({
    request: JSON.stringify(event, undefined, 2),
    params: event.pathParameters,
  });


  try {
    const { title, description, price, count } = JSON.parse(event.body ?? '');

    const id = randomUUID();
    const item = { id, title, description, price: Number(price) };

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Item: item,
          },
        },
        {
          Put: {
            TableName: process.env.STOCKS_TABLE_NAME,
            Item: { product_id: id, count: Number(count) },
          },
        },
      ],
    });

    await docClient.send(command);

    return createJsonResponse(
      { ...item, count: Number(count) },
      201,
      'OPTIONS,POST'
    );
  } catch (dbError) {
    return createJsonResponse(dbError, 500);
  }
};
