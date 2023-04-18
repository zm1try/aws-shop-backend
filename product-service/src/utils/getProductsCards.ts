import joinProductsCards from "./joinProductsCards";
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const getProducts = async () => {
    console.log('try to get all products');

    const ProductScanParams = {
        TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
    };
    
    const StockScanParams = {
        TableName: process.env.DYNAMODB_STOCKS_TABLE,
    };

    const promises = [
        dynamodb.scan(ProductScanParams).promise(),
        dynamodb.scan(StockScanParams).promise(),
    ];
    
    return Promise.all(promises)
    .then(([rawProducts, rawStocks]) => {
        console.log('get all products');

        const { Items: products } = rawProducts;
        const { Items: stocks } = rawStocks;
        return joinProductsCards(products, stocks);
    })
    .catch(error => {
        console.log(error || 'error while get all products');
    });
};

export default getProducts;