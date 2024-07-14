#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { config } from '../config';

type HandlersProps = {
  snsArn: string;
};

export class Handlers extends Construct {
  public readonly getProductsHandler: Function;
  public readonly getProductByIdHandler: Function;
  public readonly createProductHandler: Function;
  public readonly catalogBatchProcessHandler: Function;

  constructor(parent: Stack, name: string, props: HandlersProps) {
    super(parent, name);

    this.getProductsHandler = new Function(this, 'GetProductsList', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: config.productTableName,
        STOCKS_TABLE_NAME: config.stockTableName,
      },
    });

    this.getProductByIdHandler = new Function(this, 'GetProductsById', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCTS_TABLE_NAME: config.productTableName,
        STOCKS_TABLE_NAME: config.stockTableName,
      },
    });

    this.createProductHandler = new Function(this, 'CreateProduct', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'createProduct.handler',
      environment: {
        PRODUCTS_TABLE_NAME: config.productTableName,
        STOCKS_TABLE_NAME: config.stockTableName,
      },
    });

    this.catalogBatchProcessHandler = new Function(
      this,
      'CatalogBatchProcessHandler',
      {
        runtime: Runtime.NODEJS_20_X,
        code: Code.fromAsset('dist/handlers'),
        handler: 'catalogBatchProcess.handler',
        environment: {
          SNS_ARN: props.snsArn,
        },
      }
    );
  }
}
