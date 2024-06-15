import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AwsShopCdkStack } from '../lib/aws-shop-cdk-stack';
import { APIGatewayEvent } from 'aws-lambda';
import { handler as getProductsListHandler } from '../lambda/getProductsList';
import { handler as getProductsByIdHandler } from '../lambda/getProductsById';

const CORRECT_ID = '7567ec4b-b10c-48c5-9345-fc73348a80a1'
const WRONG_ID = 'WRONG_ID'

let appStack: Stack;
let appTemplate: Template;
const event: APIGatewayEvent = {
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: '',
  isBase64Encoded: false,
  path: '',
  pathParameters: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: '',
    apiId: '',
    authorizer: undefined,
    protocol: '',
    httpMethod: '',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '',
      user: null,
      userAgent: null,
      userArn: null,
    },
    path: '',
    stage: '',
    requestId: '',
    requestTimeEpoch: 0,
    resourceId: '',
    resourcePath: '',
  },
  resource: '',
};

beforeAll(async () => {
  appStack = new AwsShopCdkStack(new App(), 'MyTestStack');
  appTemplate = Template.fromStack(appStack);
});

describe('getProductsList Lambda', () => {
  test('Lambda created', () => {
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'getProductsList.handler',
    });
  });

  test('result', async () => {
    const response = await getProductsListHandler(event);

    expect(response.statusCode).toBe(200);

    const allProducts = JSON.parse(response.body);

    expect(Array.isArray(allProducts)).toBe(true);
    expect(allProducts.length).toBeGreaterThan(0);

    const firstElem = allProducts[0];
    expect(typeof firstElem.description === 'string').toBe(true);
    expect(typeof firstElem.id === 'string').toBe(true);
    expect(typeof firstElem.price === 'number').toBe(true);
    expect(typeof firstElem.title === 'string').toBe(true);
  });
});

describe('getProductsById Lambda', () => {
  test('Lambda created', () => {
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'getProductsById.handler',
    });
  });
  test('correct result', async () => {
    const response = await getProductsByIdHandler({
      ...event,
      pathParameters: {
        ...event.pathParameters,
        id: CORRECT_ID,
      },
    });

    expect(response.statusCode).toBe(200);

    const product = JSON.parse(response.body);

    expect(Array.isArray(product)).toBe(false);

    expect(typeof product.description === 'string').toBe(true);
    expect(typeof product.id === 'string').toBe(true);
    expect(typeof product.price === 'number').toBe(true);
    expect(typeof product.title === 'string').toBe(true);
  });

  test('missed result', async () => {
    const response = await getProductsByIdHandler({
      ...event,
      pathParameters: {
        ...event.pathParameters,
        id: WRONG_ID,
      },
    });
    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('Product not found');
  });
});
