#!/usr/bin/env node
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  AttributeType,
  Table,
  TableEncryption,
} from 'aws-cdk-lib/aws-dynamodb';
import { config } from '../config';

export class DB extends Construct {
  public readonly productsTable: Table;
  public readonly stocksTable: Table;

  constructor(parent: Stack, name: string) {
    super(parent, name);

    this.productsTable = new Table(this, config.PRODUCTS_TABLE_NAME, {
      tableName: config.PRODUCTS_TABLE_NAME,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: TableEncryption.AWS_MANAGED,
    });

    this.stocksTable = new Table(this, config.STOCKS_TABLE_NAME, {
      tableName: config.STOCKS_TABLE_NAME,
      partitionKey: {
        name: 'product_id',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: TableEncryption.AWS_MANAGED,
    });
  }
}
