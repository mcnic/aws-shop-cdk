#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SNSClient } from '@aws-sdk/client-sns';
import { config } from '../config';
import {
  Subscription,
  SubscriptionFilter,
  SubscriptionProtocol,
  Topic,
  TopicPolicy,
} from 'aws-cdk-lib/aws-sns';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  AnyPrincipal,
  PolicyDocument,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';

const snsClient = new SNSClient({});

export class SNS extends Construct {
  public topic: Topic;

  constructor(parent: Stack, name: string) {
    super(parent, name);

    this.topic = new Topic(parent, config.topicName, {
      topicName: config.topicName,
    });

    new Subscription(this, 'Subscription', {
      topic: this.topic,
      endpoint: config.emails.importSuccess,
      protocol: SubscriptionProtocol.EMAIL,
    });

    new Subscription(this, 'SubscriptionLongQueue', {
      topic: this.topic,
      endpoint: config.emails.imporLongQueue,
      protocol: SubscriptionProtocol.EMAIL,
      filterPolicy: {
        totalCount: SubscriptionFilter.numericFilter({
          greaterThanOrEqualTo: 5,
        }),
      }
    });

  }

  public addPermisions(handler: IFunction) {
    const policyDocument = new PolicyDocument({
      assignSids: true,
      statements: [
        new PolicyStatement({
          actions: ['sns:Publish'],
          principals: [new AnyPrincipal()],
          resources: [this.topic.topicArn],
        }),
      ],
    });

    const topicPolicy = new TopicPolicy(this, 'Policy', {
      topics: [this.topic],
      policyDocument,
    });
  }
}
