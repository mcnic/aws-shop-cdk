import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createJsonResponse } from '../helpers/responses';

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
    const stocksHashArr: Record<string, any> = {};

    if (stocks.Items) {
      for (let s of stocks.Items) stocksHashArr[s.product_id] = s.count;
    }

    const fullProducts =
      products.Items?.map((e) => ({ ...e, count: stocksHashArr[e.id] || 0 })) ||
      [];

    return createJsonResponse(fullProducts);
  } catch (dbError) {
    return createJsonResponse(dbError, 500);
  }
};
