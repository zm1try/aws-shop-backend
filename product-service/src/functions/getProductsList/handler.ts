import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import getProductsCards from '../../utils/getProductsCards';

import schema from './schema';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  try {
    const productsList = await getProductsCards();
    return formatJSONResponse({ productsList }); 
  } catch (error) {
    console.log('can not get products');
    return formatJSONResponse({ message: 'Unknown error.' }, 500);
  }
  
};

export const main = middyfy(getProductsList);
