import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3 } from 'aws-sdk';
import schema from './schema';
import { BUCKET_NAME, EXPIRATION_TIME, UPLOAD_FOLDER, REGION } from '../../../config.json';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { queryStringParameters: { name: fileName } } = event;
    const s3Instance = new S3({ region: REGION });
    const urlForUpload = await s3Instance.getSignedUrlPromise('putObject', {
      Bucket: BUCKET_NAME,
      Key: `${UPLOAD_FOLDER}/${fileName}`,
      Expires: EXPIRATION_TIME,
      ContentType: 'text/csv',
    });

    return formatJSONResponse(urlForUpload);
  } catch(error) {
    return formatJSONResponse({ messagw: 'Unkonow error' }, 500);
  }
};

export const main = middyfy(importProductsFile);
