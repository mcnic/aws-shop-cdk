#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Queue, QueueEncryption, QueueProps } from 'aws-cdk-lib/aws-sqs';

export class SQS extends Construct {
  public readonly queue: Queue;

  constructor(parent: Stack, name: string, props: QueueProps) {
    super(parent, name);

    this.queue = new Queue(this, name, {
      ...props,
      queueName: name,
      encryption: QueueEncryption.SQS_MANAGED,
    });
  }
}
