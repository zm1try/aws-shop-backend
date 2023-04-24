import AWS from 'aws-sdk';
import AWSMock from 'aws-sdk-mock';
import { main as importProductsFile } from './handler';

describe('importProductsFile', () => {
    it('should return success response', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('S3', 'getSignedUrl', 'testUrl');
        const mockEvent: any = { queryStringParameters: { name: 'file.csv' }, headers: { 'Content-Type': 'text/csv' } };
        const mockContext: any = {};
        const result = await importProductsFile(mockEvent, mockContext);
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe("{\"urlForUpload\":\"testUrl\"}");
    });
});