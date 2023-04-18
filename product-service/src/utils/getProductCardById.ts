import joinProductsCard from "./joinProductsCard";
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const getProductCardById = async (id) => {
    console.log('try to get product by id - ', id);
    
    const ProductScanParams = {
        TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {':id': id},
    };
    
    const StockScanParams = {
        TableName: process.env.DYNAMODB_STOCKS_TABLE,
        KeyConditionExpression: 'product_id = :product_id',
        ExpressionAttributeValues: {':product_id': id},
    };

    const promises = [
        dynamodb.query(ProductScanParams).promise(),
        dynamodb.query(StockScanParams).promise(),
    ];

    return Promise.all(promises)
    .then(([rawProduct, rawStock]) => {
        console.log('get product');
        const { Items: [ product ] } = rawProduct;
        const { Items: [ stock ] } = rawStock;
        return joinProductsCard(product, stock);
    })
    .catch(error => {
        console.log(error || 'error while get product');
    });
};

export default getProductCardById;