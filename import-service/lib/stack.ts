import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { S3Actions, S3Bucket } from './constructs/s3Bucket';
import { config } from './config';
import { Handlers } from './constructs/handlers';
import { ImportsAPI } from './constructs/api';

/*
  Tutorial: Using an Amazon S3 trigger to invoke a Lambda function: 
  'https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html'

  New Event Notifications for Amazon S3
  'https://aws.amazon.com/blogs/aws/s3-event-notification/'

  'https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_s3_notifications/README.html'


  [AWS] Add S3 Event Notification with CDK Typescript
  'https://medium.com/@nagarjun_nagesh/aws-add-s3-event-notification-with-cdk-typescript-80fd55242b86'
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
    const { importProductsFileHandler, importFileParserHandler } = new Handlers(
      this,
      'importProducts',
      {
        bucketName: config.bucketName,
      }
    );

    // *** Import file ***
    // grant permissions for importProductsFileHandler
    uploadBucketConstruct.addPermisions(
      importProductsFileHandler,
      [S3Actions.PUT],
      config.uploadPath
    );

    // add API gateways
    new ImportsAPI(this, 'ImportAPI', { handler: importProductsFileHandler });

    // *** Parse file ***
    // grant permissions for importFileParserHandler
    uploadBucketConstruct.addPermisions(
      importFileParserHandler,
      [S3Actions.GET],
      config.uploadPath
    );
    uploadBucketConstruct.addPermisions(
      importFileParserHandler,
      [S3Actions.PUT],
      config.parsedPath
    );

    // add event to start parsing new file
    uploadBucketConstruct.addEvent(
      EventType.OBJECT_CREATED,
      importFileParserHandler,
      config.uploadPath
    );
  }
}
