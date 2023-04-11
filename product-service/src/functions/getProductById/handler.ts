import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import getProductCardById from '../../utils/getProductCardById';
import { ProductNotFoundError } from '@errors/productNotFoundError';
// import createClient from '../../utils/createClient';

import schema from './schema';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  // const client = createClient();
  
  try {
    // client.connect();

    const { pathParameters: { id } } = event;

    // const queryResult = await client.query('SELECT products.*, stocks.count FROM products LEFT JOIN stocks ON products.id=stocks.product_id WHERE products.id=$1', [id]);
    // const product = queryResult.rows;

    console.log('product id for search - ', id);
    const product = await getProductCardById(id);
    if (!product) throw new ProductNotFoundError(); 
    return formatJSONResponse({ product }); 
  } catch (error) {
    const isProductNotFoundError = error instanceof ProductNotFoundError;
    const errorMessage = isProductNotFoundError ? error.message : 'Unknown error';
    const errorStatusCode = isProductNotFoundError ? 404 : 500;
    console.log(errorMessage || 'can not get product by id');
    return formatJSONResponse({ message: errorMessage }, errorStatusCode);
  }
  // finally {
  //   client.end();
  // }
};

export const main = middyfy(getProductById);
