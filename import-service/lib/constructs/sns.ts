#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CreateTopicCommand,
  SNSClient,
  SubscribeCommand,
} from '@aws-sdk/client-sns';
import { config } from '../config';

const snsClient = new SNSClient({});

export class SNS extends Construct {
  public topicArn: string;

  constructor(parent: Stack, name: string) {
    super(parent, name);

    snsClient.send(new CreateTopicCommand({ Name: config.topicName }));
  }

  protected async createTopic() {
    const snsClient = new SNSClient({});
    const response = await snsClient.send(
      new CreateTopicCommand({ Name: config.topicName })
    );
    console.log('createTopic response', response);

    if (response.TopicArn) {
      this.topicArn = response.TopicArn;
    }
  }

  protected async subscribeToEmail(
    emailAddress: string,
    attributes?: Record<string, string>
  ) {
    if (!emailAddress) {
      throw new Error('wrong emailAddress for subscribe');
    }

    if (!this.topicArn) {
      throw new Error('wrong topicArn for subscribe');
    }

    const response = await snsClient.send(
      new SubscribeCommand({
        Protocol: 'email',
        TopicArn: this.topicArn,
        Endpoint: emailAddress,
        Attributes: attributes,
      })
    );
    console.log('SNS subscribed to Email', emailAddress, response);
  }

  async createTopicAndSubscribe(emailAddress: string) {
    await this.createTopic();

    await this.subscribeToEmail(emailAddress, {
      // // This subscription will only receive messages with the 'event' attribute set to 'order_placed'.
      // FilterPolicyScope: 'MessageAttributes',
      // FilterPolicy: JSON.stringify({
      //   event: ['order_placed'],
      // }),
    });
  }
}
