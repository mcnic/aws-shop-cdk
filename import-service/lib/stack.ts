import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { S3Bucket } from './constructs/s3Bucket';
import { config } from './config';

export class ImportServiceStack extends cdk.Stack {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const uploadBucket = new S3Bucket(this, 'ImportServiceBucketUploads', {
      bucketName: config.bucketName,
      allowedMethods: [HttpMethods.PUT],
    });
  }
}
