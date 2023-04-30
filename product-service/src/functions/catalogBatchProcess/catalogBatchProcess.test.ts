import { SQSEvent } from "aws-lambda";
import AWS from 'aws-sdk';
import AWSMock from 'aws-sdk-mock';
import { main as catalogBatchProcess } from './handler';

jest.mock('../../utils/createProductCard', () => () => Promise.resolve(true));

describe('catalogBatchProcess', () => {
    it('should return success response', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('SNS','publish', Promise.resolve());

        const product = {"title":"new1","description":"desc1","price":"111","count":"222"};
        const record =   {
            messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
            receiptHandle: 'MessageReceiptHandle',
            body: JSON.stringify(product),
            attributes: {
              ApproximateReceiveCount: '1',
              SentTimestamp: '1523232000000',
              SenderId: '1',
              ApproximateFirstReceiveTimestamp: '1523232000001'
            },
            headers: {},
            messageAttributes: {},
            md5OfBody: '{{{md5_of_body}}}',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:1:MyQueue',
            awsRegion: 'us-east-1'
          };
        
        const mockEvent: SQSEvent = { Records: [ record ] };
        const mockContext: any = {};
        const result = await catalogBatchProcess(mockEvent, mockContext);
        expect(result.statusCode).toBe(201);
        expect(result.body).toBe(`{\"message\":\"Products with max price: ${product.price} created\"}`);
    });
});
