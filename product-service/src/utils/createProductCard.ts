const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
const dynamodb = new AWS.DynamoDB.DocumentClient();

const createProductCard = async (productData): Promise<boolean> => {
    console.log('try to create product');

    const id = uuidv4();
    const { title, description, price, count } = productData;

    const transaction = dynamodb.transactWrite({
        TransactItems: [
          {
            Put: {
              Item: { id, title, description, price: +price },
              TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
            },
          },
          {
            Put: {
              Item: { product_id: id, count: +count },
              TableName: process.env.DYNAMODB_STOCKS_TABLE,
            },
          },
        ],
    }).promise();

    return transaction
    .then(() => {
        console.log('product created');
        return true;
    })
    .catch((error) => {
        console.log(error || 'product not created');
        return false;
    });
};

export default createProductCard;