#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

import { config } from '../config';

export class Handlers extends Construct {
  public readonly getProductsHandler: Function;
  public readonly getProductByIdHandler: Function;
  public readonly createProductHandler: Function;

  constructor(parent: Stack, name: string) {
    super(parent, name);

    this.getProductsHandler = new Function(this, 'GetProductsList', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'getProductsList.handler',
      environment: config,
    });

    this.getProductByIdHandler = new Function(this, 'GetProductsById', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'getProductsById.handler',
      environment: config,
    });

    this.createProductHandler = new Function(this, 'CreateProduct', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'createProduct.handler',
      environment: config,
    });
  }
}
