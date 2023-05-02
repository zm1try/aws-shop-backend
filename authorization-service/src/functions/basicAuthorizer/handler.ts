import { middyfy } from '@libs/lambda';

async function basicAuthorizer(event) {
  console.log(event);

  const { authorizationToken = '', methodArn, type } = event;
  const authorizationTokenValue = authorizationToken.replace('Basic ', '');

  if (!authorizationTokenValue || type !== 'TOKEN') {
    throw("Unauthorized");
  }

  const creds = Buffer.from(authorizationTokenValue, 'base64').toString('utf-8').split(':');
  const [ username, password ] = creds;
  const effect = password && password === process.env[username] ? 'Allow' : 'Deny';

  console.log(effect);
  return generatePolicy(authorizationTokenValue, effect, methodArn);
}

function generatePolicy(principalId: string, effect: string, resource: string) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}

export const main = middyfy(basicAuthorizer);
