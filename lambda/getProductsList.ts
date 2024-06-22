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

  const productsCmd = new ScanCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
  });

  const stocksCmd = new ScanCommand({
    TableName: process.env.STOCKS_TABLE_NAME,
  });

  try {
    const products = await docClient.send(productsCmd);
    const stocks = await docClient.send(stocksCmd);
    const stovksHashArr: Record<string, any> = {};

    if (stocks.Items) {
      for (let s in stocks.Items) stovksHashArr[s] = stocks.Items[s];
    }

    const fullProducts =
      products.Items?.map((e) => ({ ...e, count: stovksHashArr[e.id] || 0 })) ||
      [];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify(fullProducts),
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
