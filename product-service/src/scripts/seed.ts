import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { products, stocks } from '../mocks/products';
import { config } from '../config';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const seed = async () => {
  const productCmd = new BatchWriteCommand({
    RequestItems: {
      [config.PRODUCTS_TABLE_NAME]: products.map((product) => {
        return {
          PutRequest: {
            Item: product,
          },
        };
      }),
    },
  });

  const stockCmd = new BatchWriteCommand({
    RequestItems: {
      [config.STOCKS_TABLE_NAME]: stocks.map((stock) => {
        return {
          PutRequest: {
            Item: stock,
          },
        };
      }),
    },
  });

  try {
    const productResponse = await docClient.send(productCmd);
    console.log('seed response:', productResponse);

    const stockResponse = await docClient.send(stockCmd);
    console.log('seed stock:', stockResponse);
  } catch (err) {
    console.error('error while seed', err);
  }
};

seed();
