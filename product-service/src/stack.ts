import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DB } from './constructs/db';
import { Handlers } from './constructs/handlers';
import {
  Cors,
  LambdaIntegration,
  Model,
  RequestValidator,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { productStockDto } from './dto/products';
import { SNS } from './constructs/sns';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { SQS_URL, SQS_ARN } from '../../constans';
import { grantDBPermissionForHandler } from './helpers/db';
import { config } from './config';
import { Queue } from 'aws-cdk-lib/aws-sqs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { productsTable, stocksTable } = new DB(this, 'Db');

    // get existed SQS queue
    const queue = Queue.fromQueueArn(
      this,
      'CatalogItemsQueue',
      cdk.Fn.importValue(SQS_ARN)
    );

    // console.log({
    //   SQS_ARN: cdk.Fn.importValue(SQS_ARN),
    //   queue,
    //   batchSize: config.batchSize,
    // });

    // Create SNS for email messaging
    const snsConstruct = new SNS(this, 'CatalogItemsSNS');

    const {
      getProductByIdHandler,
      getProductsHandler,
      createProductHandler,
      catalogBatchProcessHandler,
    } = new Handlers(this, 'Handlers', { snsArn: snsConstruct.topic.topicArn });

    // grant permissions for tables
    productsTable.grantReadData(getProductsHandler);
    productsTable.grantReadData(getProductByIdHandler);
    productsTable.grantWriteData(createProductHandler);
    stocksTable.grantReadData(getProductsHandler);
    stocksTable.grantReadData(getProductByIdHandler);
    stocksTable.grantWriteData(createProductHandler);

    // Consuming an SQS to getting messages from queue
    catalogBatchProcessHandler.addEventSource(
      new SqsEventSource(queue, {
        batchSize: config.batchSize,
        maxBatchingWindow: cdk.Duration.minutes(5),
        reportBatchItemFailures: true,
      })
    );
    queue.grantConsumeMessages(catalogBatchProcessHandler);

    grantDBPermissionForHandler(this, catalogBatchProcessHandler);

    snsConstruct.addPermisions();

    // add API gateways
    const api = new RestApi(this, 'ProductsApi', {
      restApiName: 'ProductsService',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        // allowCredentials: true,
      },
    });

    const items = api.root.addResource('products');
    items.addMethod('GET', new LambdaIntegration(getProductsHandler));
    items.addMethod('POST', new LambdaIntegration(createProductHandler), {
      requestValidator: new RequestValidator(this, 'RequestValidator', {
        restApi: api,
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': new Model(this, 'ProductsModel', {
          restApi: api,
          contentType: 'application/json',
          schema: productStockDto,
        }),
      },
    });

    const singleItem = items.addResource('{id}');
    singleItem.addMethod('GET', new LambdaIntegration(getProductByIdHandler));
  }
}
