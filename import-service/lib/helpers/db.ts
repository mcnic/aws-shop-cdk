import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { NewProduct } from '../types';
import { config } from '../config';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { IGrantable } from 'aws-cdk-lib/aws-iam';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const grantDBPermissionForHandler = (
  scope: Construct,
  handler: IGrantable
) => {
  const productTable = Table.fromTableName(
    scope,
    config.PRODUCTS_TABLE_NAME,
    config.PRODUCTS_TABLE_NAME
  );
  const stockTable = Table.fromTableName(
    scope,
    config.STOCKS_TABLE_NAME,
    config.STOCKS_TABLE_NAME
  );
  console.log({ productTable, stockTable });

  stockTable.grantWriteData(handler);
  productTable.grantWriteData(handler);
};

export const addNewProductsToDB = async function (products: NewProduct[]) {
  // console.log('addNewProductsToDB', products);

  for (const product of products) {
    const id = randomUUID();
    const { title, description, price, count } = product;
    const item = { id, title, description, price: Number(price) };

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: config.PRODUCTS_TABLE_NAME,
            Item: item,
          },
        },
        {
          Put: {
            TableName: config.STOCKS_TABLE_NAME,
            Item: { product_id: id, count: product.count },
          },
        },
      ],
    });

    await docClient.send(command);
  }
};
