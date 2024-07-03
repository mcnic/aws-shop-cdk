#!/usr/bin/env node
import {
  MessageAttributeValue,
  ReceiveMessageCommand,
  SendMessageCommand,
  ServiceOutputTypes,
  SQSClient,
} from '@aws-sdk/client-sqs';

const client = new SQSClient({});

export const sendSQSMessage = async (
  queueUrl: string,
  messageBody?: string,
  mssageAttributes?: Record<string, MessageAttributeValue>
): Promise<ServiceOutputTypes> => {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    DelaySeconds: 10,
    MessageBody: messageBody,
    MessageAttributes: mssageAttributes,
  });

  const response = await client.send(command);
  console.log(response);
  return response;
};

export const receive5Messages = async (queueUrl: string) => {
  client.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['CreatedTimestamp'],
      MaxNumberOfMessages: 5,
      MessageAttributeNames: ['All'],
      WaitTimeSeconds: 20,
      VisibilityTimeout: 20,
    })
  );
};
