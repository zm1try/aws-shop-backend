
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3, SQS } from 'aws-sdk';
import csvParser from 'csv-parser';
import { S3Event } from 'aws-lambda'; 
import { PARSED_FOLDER, UPLOAD_FOLDER, REGION } from '../../../config.json';

const importFileParser = async (event: S3Event) => {
  try {
    console.log(`Start parsing products from event: ${JSON.stringify(event)}`);

    const s3Instance = new S3({ region: REGION });
    const sqsInstance = new SQS();
    const queueUrl = process.env.SQS_URL;

    const { Records: records } = event;
    const notEmptyRecords = records.filter(record => Boolean(record?.s3?.object?.size));

    const recordPromiseArray = notEmptyRecords.map(record => {
      const { s3: { bucket: { name: bucketName }, object: { key: objectKey } } } = record;

      const productParsingStream = s3Instance
        .getObject({ Bucket: bucketName, Key: objectKey })
        .createReadStream()
        .pipe(csvParser());

      const logRecord = async (data) => {
        console.log(`Product: ${JSON.stringify(data)}`);
        await sqsInstance
        .sendMessage({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(data),
        })
        .promise();
      };

      const recordProcessingPromises = [];
      productParsingStream.on('data', (data) => {
        recordProcessingPromises.push(logRecord(data));
      });

      return new Promise<void>((resolve, reject) => {
        productParsingStream
          .on('end', async () => {
            await Promise.allSettled(recordProcessingPromises);
            resolve();
          })
          .on('error', reject);
      });
    });

    await Promise.allSettled(recordPromiseArray);

    const copyAndRemovePromisesArray = notEmptyRecords.map((record) => {
      console.log(`Start copying objet: ${record}`);
      const { s3: { bucket: { name: bucketName }, object: { key: objectKey } } } = record;
      return s3Instance.copyObject({
        Bucket: bucketName,
        CopySource: `${bucketName}/${objectKey}`,
        Key: objectKey.replace(UPLOAD_FOLDER, PARSED_FOLDER)
      }).promise()
      .then(() => {
        console.log(`Start deleting objet: ${record}`);
        s3Instance.deleteObject({
          Bucket: bucketName,
          Key: objectKey
        }).promise()
        .then(() => {
          console.log(`Object deleted: ${record}`);
          return Promise.resolve();
        })
        .catch(error => {
          console.log(error);
          return Promise.reject();
        });
      })
      .catch(error => {
        console.log(error);
        return Promise.reject();
      });
    });

    await Promise.all(copyAndRemovePromisesArray);

    return formatJSONResponse({
      message: 'Finish parsing products'
    });
  } catch(error) {
    console.log(`ERROR: ${error.message}\n${JSON.stringify(error)}`);
    return formatJSONResponse({ messagw: 'Unkonow error' }, 500);
  }
};

export const main = middyfy(importFileParser);
