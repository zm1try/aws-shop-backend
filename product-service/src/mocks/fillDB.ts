import { StockInterface } from "../models/stockDTO";
import { ProductInterface } from "../models/productDTO";
import products from "./products";
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient();

const promises = [];

const putProduct = async (item: ProductInterface) => {
    const putResults = await dynamodb.put({
        TableName: 'product-service-products-dev',
        Item: item,
    }).promise();

    return putResults;
};

const putStock = async (item: StockInterface) => {
    const putResults = await dynamodb.put({
        TableName: 'product-service-stocks-dev',
        Item: item,
    }).promise();

    return putResults;
};

products.forEach((item) => {
    const { id, title, description, price, count } = item;
    promises.push(putProduct({id, title, description, price}));
    promises.push(putStock({product_id: id, count}));
});

Promise.all(promises)
.then(() => {
    console.log('success');
})
.catch(error => {
    console.log(error);
});
