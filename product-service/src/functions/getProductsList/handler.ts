import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import getProductsCards from '../../utils/getProductsCards';
// import createClient from '../../utils/createClient';
import schema from './schema';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  // const client = createClient();
  try {
    // client.connect();
    // const queryResult = await client.query('SELECT products.*, stocks.count FROM products LEFT JOIN stocks ON products.id=stocks.product_id');
    // const productsList = queryResult.rows;
    const productsList = await getProductsCards();
    return formatJSONResponse({ productsList }); 
  } catch (error) {
    console.log('can not get products');
    return formatJSONResponse({ message: 'Unknown error.' }, 500);
  }
  // finally {
  //   client.end();
  // }
};

export const main = middyfy(getProductsList);
