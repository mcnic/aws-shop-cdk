#!/usr/bin/env node
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  EventType,
  HttpMethods,
} from 'aws-cdk-lib/aws-s3';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';

export const enum S3Actions {
  PUT = 's3:PutObject',
  GET = 's3:GetObject',
  DELETE = 's3:DeleteObject',
}

const client = new S3Client({});

export class S3Bucket extends Construct {
  public readonly bucket: Bucket;
  protected bucketName: string;

  constructor(
    parent: Stack,
    name: string,
    params: {
      bucketName: string;
      allowedMethods: HttpMethods[];
      autoDeleteObjects?: boolean;
      blockPublicAccess?: BlockPublicAccess;
      versioned?: boolean;
    }
  ) {
    super(parent, name);

    this.bucketName = params.bucketName;

    this.bucket = new Bucket(this, name, {
      bucketName: this.bucketName,
      enforceSSL: true,
      minimumTLSVersion: 1.2,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: params.autoDeleteObjects ?? true,
      versioned: params.versioned ?? false,
      blockPublicAccess:
        params.blockPublicAccess ?? BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedOrigins: ['*'],
          allowedMethods: params.allowedMethods,
        },
      ],
    });
  }

  public addPermisions(handler: IFunction, actions: S3Actions[], path: string) {
    handler.addToRolePolicy(
      new PolicyStatement({
        actions,
        resources: [this.bucket.arnForObjects(`${path}/*`)],
        effect: Effect.ALLOW,
      })
    );
  }

  public addEvent(event: EventType, handler: IFunction, prefix: string) {
    this.bucket.addEventNotification(event, new LambdaDestination(handler), {
      prefix,
    });
  }
}
