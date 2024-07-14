import * as cdk from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { BASIC_AUTHORIZER_ARN } from '../../constans';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    console.log({ myPassFromEnv: process.env.mcnic });

    const basicAuthorizerHandler = new Function(this, 'BasicAuthorizer', {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('dist/handlers'),
      handler: 'basicAuthorizer.handler',
      environment: {
        AUTH_USER: 'mcnic',
        AUTH_PASS: process.env.mcnic ?? '',
      },
    });

    // export authorizer arn for other services
    new cdk.CfnOutput(this, 'BasicAuthorizerArn', {
      value: basicAuthorizerHandler.functionArn,
      exportName: BASIC_AUTHORIZER_ARN,
    });
  }
}
