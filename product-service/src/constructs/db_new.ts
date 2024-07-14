#!/usr/bin/env node
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  AttributeType,
  Billing,
  TableEncryptionV2,
  TableV2,
} from 'aws-cdk-lib/aws-dynamodb';
import { config } from '../config';

export class DymanoDBTables extends Construct {
  public productsTable: TableV2;
  public stocksTable: TableV2;

  constructor(parent: Stack, name: string) {
    super(parent, name);

    this.productsTable = new TableV2(this, config.PRODUCTS_TABLE_NAME, {
      tableName: config.PRODUCTS_TABLE_NAME,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      billing: Billing.onDemand(),
      encryption: TableEncryptionV2.dynamoOwnedKey(),
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.stocksTable = new TableV2(this, config.STOCKS_TABLE_NAME, {
      tableName: config.STOCKS_TABLE_NAME,
      partitionKey: {
        name: 'product_id',
        type: AttributeType.STRING,
      },
      billing: Billing.onDemand(),
      encryption: TableEncryptionV2.dynamoOwnedKey(),
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
