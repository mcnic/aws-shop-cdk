import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async function (
  event: any = {}
): Promise<APIGatewayProxyResult> {
  console.log({
    request: JSON.stringify(event, undefined, 2),
    params: event.pathParameters,
  });

  if (!event.body) {
    return {
      statusCode: 400,
      body: 'invalid request, you are missing the parameter body',
    };
  }

  try {
    const { title, description, price, count } = JSON.parse(event.body ?? '');

    if (!title || !description || price === undefined || count === undefined) {
      return {
        statusCode: 400,
        body: 'invalid request, you are missing mandatory parameters',
      };
    }

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

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
      body: JSON.stringify({ ...item, count: Number(count) }),
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
