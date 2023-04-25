import type { AWS } from '@serverless/typescript';
import getProductsList from '@functions/getProductsList';
import getProductById from '@functions/getProductById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';
import config from './config.json';
import sqsConfig from './sqsConfig.json';
import snsConfig from './snsConfig.json';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DYNAMODB_PRODUCTS_TABLE: '${self:service}-products-${sls:stage}',
      DYNAMODB_STOCKS_TABLE: '${self:service}-stocks-${sls:stage}',
      SNS_ARN: {
        Ref: 'CatalogBatchSimpleNotificationsTopic',
      },
      ...config,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: [
              "arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/${self:service}-products-${sls:stage}",
              "arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/${self:service}-stocks-${sls:stage}",
            ],
          },
          {
            Effect: "Allow",
            Action: "sns:*",
            Resource: {
              Ref: 'CatalogBatchSimpleNotificationsTopic',
            },
          },
        ]
      }
    },
  },
  // import the function via paths
  functions: { getProductsList, getProductById, createProduct, catalogBatchProcess: {
    ...catalogBatchProcess,
    events: [
      {
        sqs: {
          arn: { 'Fn::GetAtt': ['CatalogBatchSimpleQueue', 'Arn'] },
          batchSize: 5,
        },
      },
    ],
  } },
  resources: {
    Resources: {
      Products: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: '${self:service}-products-${sls:stage}',
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
            {
              AttributeName: "title",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
            {
              AttributeName: "title",
              KeyType: "RANGE",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      Stocks: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.DYNAMODB_STOCKS_TABLE}",
          AttributeDefinitions: [
            {
              AttributeName: "product_id",
              AttributeType: "S",
            },
            {
              AttributeName: "count",
              AttributeType: "N",
            },
          ],
          KeySchema: [
            {
              AttributeName: "product_id",
              KeyType: "HASH",
            },
            {
              AttributeName: "count",
              KeyType: "RANGE",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      CatalogBatchSimpleQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: sqsConfig.QUEUE_NAME,
        },
      },
      CatalogBatchSimpleNotificationsTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: snsConfig.TOPIC_NAME,
        },
      },
      CatalogBatchSimpleNotificationsSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: snsConfig.ENDPOINT,
          TopicArn: {
            Ref: 'CatalogBatchSimpleNotificationsTopic',
          },
          FilterPolicy: {
            max_price: [{"numeric": [">=", 100]}]
          },
        },
      },
      CatalogBatchSimpleNotificationsSubscription2: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: snsConfig.ENDPOINT2,
          TopicArn: {
            Ref: 'CatalogBatchSimpleNotificationsTopic',
          },
          FilterPolicy: {
            max_price: [{"numeric": ["<", 100]}]
          },
        },
      },
    },
    Outputs: {
      CatalogBatchSimpleQueueUrl: {
        Value: {
          Ref: 'CatalogBatchSimpleQueue',
        },
        Export: {
          Name: { 'Fn::Sub': '${AWS::StackName}-CatalogBatchSimpleQueue' },
        },
      },
      CatalogBatchSimpleQueueArn: {
        Value: { 'Fn::GetAtt': ['CatalogBatchSimpleQueue', 'Arn'] },
        Export: {
          Name: { 'Fn::Sub': '${AWS::StackName}-CatalogBatchSimpleQueueArn' },
        }
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      exclude: ['aws-sdk', 'pg-native'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
