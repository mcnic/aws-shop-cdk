import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
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

  const productsCmd = new GetCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
    Key: {
      id: event.pathParameters.id,
    },
  });

  const stocksCmd = new GetCommand({
    TableName: process.env.STOCKS_TABLE_NAME,
    Key: {
      product_id: event.pathParameters.id,
    },
  });

  try {
    const productResponse = await docClient.send(productsCmd);

    const stockResponse = await docClient.send(stocksCmd);

    return productResponse.Item
      ? createJsonResponse({
          ...productResponse.Item,
          count: stockResponse.Item?.count || 0,
        })
      : createResponse('Product not found', 404);
  } catch (dbError) {
    return createJsonResponse(dbError, 500);
  }
};
