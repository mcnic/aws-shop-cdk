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

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { productsTable, stocksTable } = new DB(this, 'Db');

    const { getProductByIdHandler, getProductsHandler, createProductHandler } =
      new Handlers(this, 'Handlers');

    // grant permissions for tables
    productsTable.grantReadData(getProductsHandler);
    productsTable.grantReadData(getProductByIdHandler);
    productsTable.grantWriteData(createProductHandler);
    stocksTable.grantReadData(getProductsHandler);
    stocksTable.grantReadData(getProductByIdHandler);
    stocksTable.grantWriteData(createProductHandler);

    // add API gateways
    const api = new RestApi(this, 'Products', {
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
      requestValidator: new RequestValidator(
        this,
        'RequestValidator',
        {
          restApi: api,
          validateRequestBody: true,
        }
      ),
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
