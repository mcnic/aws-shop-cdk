import type { APIGatewayProxyResult } from 'aws-lambda';

const createResponse = (
  body: string,
  statusCode: number = 200,
  methods: string = 'GET'
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body,
  };
};

const createJsonResponse = (
  body: any,
  statusCode: number = 200,
  methods: string = 'GET'
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  };
};

export { createResponse, createJsonResponse };
