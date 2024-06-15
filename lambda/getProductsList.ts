import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from './products';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    body: JSON.stringify(products),
  };
};
