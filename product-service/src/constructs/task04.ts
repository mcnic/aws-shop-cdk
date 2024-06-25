#!/usr/bin/env node
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import {
  AttributeType,
  Table,
  TableEncryption,
} from 'aws-cdk-lib/aws-dynamodb';

export class Task04 extends Construct {
  constructor(parent: Stack, name: string) {
    super(parent, name);

    // dynamoDB tables
    const productsTable = new Table(this, 'Products', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: TableEncryption.AWS_MANAGED,
    });

    const stocksTable = new Table(this, 'Stocks', {
      partitionKey: {
        name: 'product_id',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: TableEncryption.AWS_MANAGED,
    });

    // Lambda functions
    const getProductsHandler = new Function(this, 'getProductsListHandler', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/lambda'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName
      },
    });

    const getProductByIdHandler = new Function(this, 'getProductsByIdHandler', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/lambda'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName
      },
    });

    const createProductHandler = new Function(this, 'createProductHandler', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/lambda'),
      handler: 'createProduct.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName
      },
    });

    // grant permissions for tables
    productsTable.grantReadData(getProductsHandler);
    productsTable.grantReadData(getProductByIdHandler);
    productsTable.grantWriteData(createProductHandler);
    stocksTable.grantReadData(getProductsHandler);
    stocksTable.grantWriteData(createProductHandler);

    // add API gateways
    const getAllIntegration = new LambdaIntegration(getProductsHandler);
    const getOneIntegration = new LambdaIntegration(getProductByIdHandler);
    const putOneIntegration = new LambdaIntegration(createProductHandler);

    const api = new LambdaRestApi(this, 'AWSShopNewApi', {
      handler: getProductsHandler,
      proxy: false,
    });

    const items = api.root.addResource('products');
    items.addMethod('GET', getAllIntegration);
    items.addMethod('POST', putOneIntegration);

    const singleItem = items.addResource('{id}');
    singleItem.addMethod('GET', getOneIntegration);
  }
}
