#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

type HandlersProps = {
  bucketName: string;
};

export class Handlers extends Construct {
  public readonly importProductsFileHandler: Function;

  constructor(parent: Stack, name: string, props: HandlersProps) {
    super(parent, name);

    this.importProductsFileHandler = new Function(this, name, {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'importProductsFile.handler',
      environment: { BUCKET_NAME: props.bucketName },
    });
  }
}
