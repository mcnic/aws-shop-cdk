import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { Task03 } from '../construct/task03';
import { Task04 } from '../construct/task04';

export class AwsShopCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // new Task03(this, "LambdaFunctions");

    new Task04(this, "DynamoDB");
  }
}
