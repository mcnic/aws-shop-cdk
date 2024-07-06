#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

type HandlersProps = {
  bucketName: string;
  queueUrl: string;
  snsArn: string
};

export class Handlers extends Construct {
  public readonly importProductsFileHandler: Function;
  public readonly importFileParserHandler: Function;
  public readonly catalogBatchProcess: Function;

  constructor(parent: Stack, name: string, props: HandlersProps) {
    super(parent, name);

    this.importProductsFileHandler = new Function(
      this,
      'importProductsFileHandler',
      {
        runtime: Runtime.NODEJS_20_X,
        code: Code.fromAsset('dist/handlers'),
        handler: 'importProductsFile.handler',
        environment: { BUCKET_NAME: props.bucketName },
      }
    );

    this.importFileParserHandler = new Function(
      this,
      'importFileParserHandler',
      {
        runtime: Runtime.NODEJS_20_X,
        code: Code.fromAsset('dist/handlers'),
        handler: 'importFileParser.handler',
        environment: {
          BUCKET_NAME: props.bucketName,
          QUEUE_URL: props.queueUrl,
        },
      }
    );

    this.catalogBatchProcess = new Function(this, 'CatalogBatchProcessHandler', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'catalogBatchProcess.handler',
      environment: {
        SNS_ARN: props.snsArn,
      },
    });
  }
}
