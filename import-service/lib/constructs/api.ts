#!/usr/bin/env node
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

type HandlersProps = {
  handler: IFunction;
};

export class ImportsAPI extends Construct {
  constructor(parent: Stack, name: string, props: HandlersProps) {
    super(parent, name);

    // add API gateways
    const api = new RestApi(this, name, {
      restApiName: 'ImportService',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        // allowCredentials: true,
      },
    });

    // add API method with validation
    const items = api.root.addResource('import');
    items.addMethod('GET', new LambdaIntegration(props.handler), {
      requestParameters: {
        'method.request.querystring.name': true,
      },
      requestValidatorOptions: {
        requestValidatorName: 'querystring-validator',
        validateRequestParameters: true,
        validateRequestBody: false,
      },
    });
  }
}
