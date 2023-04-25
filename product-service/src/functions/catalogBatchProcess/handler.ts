import { SQSEvent } from "aws-lambda";
import { SNS } from "aws-sdk";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { ProductDataInvalid } from '@errors/productDataInvalid';
import createProductCard from '../../utils/createProductCard';

const catalogBatchProcess = async (event: SQSEvent) => {
  try {
    const topicArn = process.env.SNS_ARN;
    const sns = new SNS({ region: process.env.REGION });
    console.log(event.Records);
    const productsToCreate = event.Records.map(({ body }) => JSON.parse(body));
    productsToCreate.forEach(async (product) => {
      const isProductCreated = await createProductCard(product);
      if (!isProductCreated) { 
        console.log('createProductCard error');
        throw new Error();
      }
    });
    console.log('try to send notification');
    const maxPrice = Math.max(...productsToCreate.map(item => item.price));
    await sns
    .publish({
      Subject: "Batch created",
      Message: JSON.stringify(productsToCreate),
      MessageAttributes: {
        max_price: {
          "DataType": "Number",
          "StringValue": `${maxPrice}`,
        },
      },
      TopicArn: topicArn,
    })
    .promise();

    return formatJSONResponse({ message: `Products with max price: ${maxPrice} created` }, 201); 
  } catch(error) {
    const errorMessage = { message: `ERROR: ${error.message}, ${JSON.stringify(error)}` };
    console.log(errorMessage);
    const isProductDataInvalid = error instanceof ProductDataInvalid;
    const errorStatusCode = isProductDataInvalid ? 400 : 500;
    return formatJSONResponse({ message: errorMessage }, errorStatusCode);
  }
};

export const main = middyfy(catalogBatchProcess);
