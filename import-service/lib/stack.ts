import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { S3Actions, S3Bucket } from './constructs/s3Bucket';
import { config } from './config';
import { Handlers } from './constructs/handlers';
import { ImportsAPI } from './constructs/api';
import { SQS } from './constructs/sqs';
import { Duration } from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { grantDBPermissionForHandler } from './helpers/db';

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
    const { queue } = new SQS(this, 'CatalogItemsQueue', {});

    // Create lambda handlerts
    const {
      importProductsFileHandler,
      importFileParserHandler,
      catalogBatchProcess,
    } = new Handlers(this, 'importProducts', {
      bucketName: config.bucketName,
      queueUrl: queue.queueUrl,
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

    // Consuming an SQS to getting messages from queue
    catalogBatchProcess.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 5,
        maxBatchingWindow: Duration.minutes(5),
        reportBatchItemFailures: true,
      })
    );
    queue.grantConsumeMessages(catalogBatchProcess);

    grantDBPermissionForHandler(this, catalogBatchProcess);
  }
}
