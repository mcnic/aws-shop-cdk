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
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset('dist/lambda'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    });

    const getProductByIdHandler = new Function(this, 'GetProductsByIdHandler', {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset('dist/lambda'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    });

    const addProductHandler = new Function(this, 'AddProductHandler', {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset('dist/lambda'),
      handler: 'addProduct.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    });

    // grant permissions for tables
    productsTable.grantReadWriteData(getProductsHandler);
    productsTable.grantReadWriteData(getProductByIdHandler);
    productsTable.grantReadWriteData(addProductHandler);
    stocksTable.grantReadWriteData(getProductsHandler);

    // add API gateways
    const getAllIntegration = new LambdaIntegration(getProductsHandler);
    const getOneIntegration = new LambdaIntegration(getProductByIdHandler);
    const putOneIntegration = new LambdaIntegration(addProductHandler);

    const api = new LambdaRestApi(this, 'AWSShopNewApi', {
      handler: getProductsHandler,
      proxy: false,
    });

    const items = api.root.addResource('products');
    items.addMethod('GET', getAllIntegration);

    const singleItem = items.addResource('{id}');
    singleItem.addMethod('GET', getOneIntegration);
    singleItem.addMethod('POST', putOneIntegration);
  }
}
