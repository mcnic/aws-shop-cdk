import { APIGatewayProxyResult } from 'aws-lambda';
import { products } from './products';

export const handler = async (
  event: any = {}
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters.id;
  const product = products.find((e) => e.id === id);

  return product
    ? {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
        body: JSON.stringify(product),
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
};
