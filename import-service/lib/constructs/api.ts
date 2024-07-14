#!/usr/bin/env node
import { Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  Cors,
  LambdaIntegration,
  RestApi,
  TokenAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

type HandlersProps = {
  handler: IFunction;
  basicAuthorizerHandlder: IFunction;
  sourceArn: string;
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

    // console.log({ api: api.restApiId });

    const authRole = new Role(this, 'authRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    authRole.addToPolicy(
      new PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: [props.basicAuthorizerHandlder.functionArn],
      })
    );

    const authorizer = new TokenAuthorizer(this, 'CustomBasicAuthAuthorizer', {
      handler: props.basicAuthorizerHandlder,
      assumeRole: authRole,
    });

    // add API method with validation
    const items = api.root.addResource('import');
    items.addMethod('GET', new LambdaIntegration(props.handler), {
      authorizer,
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
