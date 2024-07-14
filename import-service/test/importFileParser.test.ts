import { S3CreateEvent } from 'aws-lambda';
import { createResponse } from '../lib/helpers/responses';
import { handler as importFileParserHandler } from '../lib/handlers/importFileParser';
import { createReadStream } from 'fs';
import { join as pathJoin } from 'node:path';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { sdkStreamMixin } from '@smithy/util-stream';
import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';

const s3MockEvent = {
  Records: [
    {
      s3: {
        bucket: {
          name: 'my-backet',
        },
        object: {
          key: 'file.csv',
        },
      },
    },
  ],
} as S3CreateEvent;

const s3Mock = mockClient(S3Client);
const sqsMock = mockClient(SQSClient);

/* const getMockMessages = () => {
  return sqsMock
    .commandCalls(SendMessageBatchCommand)
    .flatMap((c) => c.args[0].input.Entries)
    .map((e) => JSON.parse(e!.MessageBody!));
}; */

describe('importFileParser', () => {
  beforeAll(() => {
    const mockFile = pathJoin(process.cwd(), 'test/mock.csv');
    s3Mock
      .on(GetObjectCommand)
      .resolves({ Body: sdkStreamMixin(createReadStream(mockFile)) });
    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});

    sqsMock.on(SendMessageBatchCommand).resolves({});
  });

  afterAll(() => {
    s3Mock.restore();
  });

  test('parse csv file', async () => {
    const res = await importFileParserHandler(s3MockEvent);

    expect(res).toEqual(createResponse('ok'));
  });
});

/*
import { createReadStream } from "fs";
import { handler as importFileParser } from "../assets/lambda/importFileParser";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { Context, S3CreateEvent } from "aws-lambda";
import { mockClient } from "aws-sdk-client-mock";
import { sdkStreamMixin } from "@smithy/util-stream";
import productsParsed from "../mock/products/products.csv-parsed.json";

import "aws-sdk-client-mock-jest";

const s3Mock = mockClient(S3Client);
const sqsMock = mockClient(SQSClient);

const SQS_URL = "sqs-url";
const BUCKET_NAME = "bucket-name";
const SRC_FILE_KEY = "uploaded/products.csv";
const DST_FILE_KEY = "parsed/products.csv";

const invokeImportFileParser = <E extends S3CreateEvent>(
  event: Partial<E> = {}
) => {
  return importFileParser(event as E, {} as Context, () => {});
};

const getSendMessageBatchCalledMessages = () => {
  return sqsMock
    .commandCalls(SendMessageBatchCommand)
    .flatMap((c) => c.args[0].input.Entries)
    .map((e) => JSON.parse(e!.MessageBody!));
};

describe("Lambda importFileParser test group", () => {
  beforeAll(() => {
    sqsMock.on(SendMessageBatchCommand).resolves({});
  });

  beforeEach(() => {
    s3Mock.on(GetObjectCommand).resolves({
      Body: sdkStreamMixin(createReadStream("./mock/products/products.csv")),
    });
    process.env = { SQS_URL };
  });

  afterEach(() => {
    jest.clearAllMocks();
    sqsMock.resetHistory();
    s3Mock.resetHistory();
  });

  const event = {
    Records: [
      {
        s3: {
          bucket: { name: BUCKET_NAME },
          object: { key: SRC_FILE_KEY },
        },
      },
    ],
  } as S3CreateEvent;

  describe("Send messages", () => {
    const batchSize = 5;
    test(`Send messages in batch groups with ${batchSize} elements`, async () => {
      await invokeImportFileParser(event);
      expect(sqsMock).toHaveReceivedCommandTimes(
        SendMessageBatchCommand,
        Math.ceil(productsParsed.length / 5)
      );
    });

    test("Send appropriate data", async () => {
      await invokeImportFileParser(event);
      const calledMessages = getSendMessageBatchCalledMessages();
      expect(calledMessages).toMatchObject(productsParsed);
    });

    test("Skip malformed messages", async () => {
      s3Mock.on(GetObjectCommand).resolves({
        Body: sdkStreamMixin(
          createReadStream("./mock/products/products.invalid.csv")
        ),
      });
      await invokeImportFileParser(event);
      const calledMessages = getSendMessageBatchCalledMessages();
      expect(calledMessages.length).toBe(2);
    });
  });

  describe("Create products", () => {
    test("Put/Delete commands have been called at least once", async () => {
      await invokeImportFileParser(event);
      expect(s3Mock).toHaveReceivedCommandTimes(CopyObjectCommand, 1);
      expect(s3Mock).toHaveReceivedCommandTimes(DeleteObjectCommand, 1);
    });

    test("Put/Delete commands move file from 'uploaded/' to 'parsed/'", async () => {
      await invokeImportFileParser(event);
      expect(s3Mock).toHaveReceivedCommandWith(CopyObjectCommand, {
        CopySource: `/${BUCKET_NAME}/${SRC_FILE_KEY}`,
        Bucket: BUCKET_NAME,
        Key: DST_FILE_KEY,
      });
      expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
        Bucket: BUCKET_NAME,
        Key: SRC_FILE_KEY,
      });
    });
  });
});
*/