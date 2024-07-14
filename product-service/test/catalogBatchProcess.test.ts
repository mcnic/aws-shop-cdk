import 'aws-sdk-client-mock-jest';
import { Context, SQSEvent } from 'aws-lambda';
import { handler } from '../src/handlers/catalogBatchProcess';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

const dbMock = mockClient(DynamoDBClient);
const dbDocMock = mockClient(DynamoDBDocumentClient);
const snsMock = mockClient(SNSClient);
const mockContext = {} as Context;

describe('catalogBatchProcess.test', () => {
  beforeAll(() => {
    process.env.SNS_ARN = 'arn:sns';
  });

  beforeEach(() => {
    dbDocMock.on(TransactWriteCommand).resolves({});
    snsMock.on(PublishCommand).resolves({});
  });

  afterEach(() => {
    dbDocMock.reset();
    snsMock.reset();
  });

  afterAll(() => {
    dbMock.restore();
    dbDocMock.restore();
    snsMock.restore();
  });

  test('processing non empty array', async () => {
    const sqsMockEvent = {
      Records: [
        {
          body: JSON.stringify([
            {
              description: 'Short Product Description1',
              price: '24',
              title: 'ProductOne',
              count: '1',
            },
            {
              description: 'Short Product Description7',
              price: '15',
              title: 'ProductTitle',
              count: '1',
            },
            {
              description: 'Short Product Description2',
              price: '23',
              title: 'Product',
              count: '1',
            },
          ]),
        },
      ],
    } as SQSEvent;

    await handler(sqsMockEvent, mockContext, () => {});

    expect(dbDocMock).toHaveReceivedCommandTimes(TransactWriteCommand, 3);

    expect(snsMock).toHaveReceivedCommandTimes(PublishCommand, 1);
  });

  test('processing empty array', async () => {
    const sqsMockEvent = {
      Records: [],
    } as SQSEvent;

    await handler(sqsMockEvent, mockContext, () => {});

    expect(dbDocMock).toHaveReceivedCommandTimes(TransactWriteCommand, 0);

    expect(snsMock).toHaveReceivedCommandTimes(PublishCommand, 1);
  });
});
