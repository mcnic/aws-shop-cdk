import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { S3Actions, S3Bucket } from './constructs/s3Bucket';
import { config } from './config';
import { Handlers } from './constructs/handlers';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

/*
  Tutorial: Using an Amazon S3 trigger to invoke a Lambda function: 
  'https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html'
*/

export class ImportServiceStack extends cdk.Stack {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create Bucket
    const uploadBucketConstruct = new S3Bucket(
      this,
      'ImportServiceBucketUploads',
      {
        bucketName: config.bucketName,
        allowedMethods: [HttpMethods.PUT],
      }
    );

    // create lambda handlerts
    const { importProductsFileHandler } = new Handlers(this, 'importProducts', {
      bucketName: config.bucketName,
    });

    // grant permissions for importProductsFileHandler
    uploadBucketConstruct.addPermisions(
      importProductsFileHandler,
      [S3Actions.PUT],
      config.uploadPath
    );

    // add API gateways
    const api = new RestApi(this, 'Import', {
      restApiName: 'ImportService',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        // allowCredentials: true,
      },
    });

    // add API method with validation
    const items = api.root.addResource('import');
    items.addMethod('GET', new LambdaIntegration(importProductsFileHandler), {
      requestParameters: {
        'method.request.querystring.name': true,
      },
      requestValidatorOptions: {
        requestValidatorName: 'querystring-validator',
        validateRequestParameters: true,
        validateRequestBody: false,
      },
    });
  }
}
