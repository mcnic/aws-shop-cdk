import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerHandler,
} from 'aws-lambda';

export const handler: APIGatewayTokenAuthorizerHandler = async function (
  event
) {
  console.log({ event });

  const token = event.authorizationToken;
  const effect = compareTokenWithCredentials(
    token,
    process.env.AUTH_USER,
    process.env.AUTH_PASS
  )
    ? 'Allow'
    : 'Deny';

  return {
    principalId: 'mcnic',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          // Resource: event.methodArn,
          Resource: '*',
        },
      ],
    },
  } satisfies APIGatewayAuthorizerResult;
};

const btoa = (str: string) => Buffer.from(str).toString('base64');

function compareTokenWithCredentials(
  token: string,
  user: string = '',
  pass: string = ''
) {
  console.log({ token, user, pass, dst: btoa(`${user}:${pass}`) });

  return token === `Basic ${btoa(`${user}:${pass}`)}`;
}
