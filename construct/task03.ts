#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';

export class Task03 extends Construct {
  constructor(parent: Stack, name: string) {
    super(parent, name);

    const getProductsListLambda = new Function(this, 'getProductsListLambda', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/lambda/getProductsList'),
      handler: 'getProductsList.handler',
    });

    const getProductsByIdLambda = new Function(this, 'getProductsByIdLambda', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/lambda/getProductsById'),
      handler: 'getProductsById.handler',
    });

    const getAllIntegration = new LambdaIntegration(getProductsListLambda);
    const getOneIntegration = new LambdaIntegration(getProductsByIdLambda);

    const api = new LambdaRestApi(this, 'AWSShopApi', {
      handler: getProductsListLambda,
      proxy: false,
    });

    const items = api.root.addResource('products');
    items.addMethod('GET', getAllIntegration);

    const singleItem = items.addResource('{id}');
    singleItem.addMethod('GET', getOneIntegration);
  }
}
