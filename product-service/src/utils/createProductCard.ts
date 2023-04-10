const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
const dynamodb = new AWS.DynamoDB.DocumentClient();

const createProductCard = async (productData): Promise<boolean> => {
    console.log('try to create product');
    
    const id = uuidv4();
    const { title, description, price, count } = productData;

    const ProductScanParams = {
        TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
        Item: { id, title, description, price },
    };

    const StockScanParams = {
        TableName: process.env.DYNAMODB_STOCKS_TABLE,
        Item: { product_id: id, count },
    };

    const promises = [
        dynamodb.put(ProductScanParams).promise(),
        dynamodb.put(StockScanParams).promise(),
    ];

    return Promise.all(promises)
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