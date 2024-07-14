import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { S3Actions, S3Bucket } from './constructs/s3Bucket';
import { config } from './config';
import { Handlers } from './constructs/handlers';
import { ImportsAPI } from './constructs/api';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SQS_URL, SQS_ARN } from '../../constans';

export class ImportServiceStack extends cdk.Stack {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Bucket
    const uploadBucketConstruct = new S3Bucket(
      this,
      'ImportServiceBucketUploads',
      {
        bucketName: config.bucketName,
        allowedMethods: [HttpMethods.PUT],
      }
    );

    // Create SQS queue
    const queue = new Queue(this, 'ImportProductsQueue', {
      queueName: 'ImportProductsQueue',
      encryption: QueueEncryption.SQS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create lambda handlerts
    const { importProductsFileHandler, importFileParserHandler } = new Handlers(
      this,
      'importProducts',
      {
        bucketName: config.bucketName,
        queueUrl: queue.queueUrl,
      }
    );

    // SQS permissions
    new PolicyStatement({
      actions: ['sqs:SendMessage'],
      resources: [queue.queueArn],
      effect: Effect.ALLOW,
    });

    // Import file: grant permissions for importProductsFileHandler
    uploadBucketConstruct.addPermisions(
      importProductsFileHandler,
      [S3Actions.PUT],
      config.uploadPath
    );

    // Add API gateways
    new ImportsAPI(this, 'ImportAPI', { handler: importProductsFileHandler });

    // Parse file: grant permissions for importFileParserHandler
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
    uploadBucketConstruct.addPermisions(
      importFileParserHandler,
      [S3Actions.DELETE],
      config.uploadPath
    );
    queue.grantSendMessages(importFileParserHandler);

    // Add event to start parsing new file
    uploadBucketConstruct.addEvent(
      EventType.OBJECT_CREATED,
      importFileParserHandler,
      config.uploadPath
    );

    // export sqs params
    new cdk.CfnOutput(this, 'ImportProductsQueueUrl', {
      value: queue.queueUrl,
      exportName: SQS_URL,
    });

    new cdk.CfnOutput(this, 'ImportProductsQueueArn', {
      value: queue.queueArn,
      exportName: SQS_ARN,
    });
  }
}
