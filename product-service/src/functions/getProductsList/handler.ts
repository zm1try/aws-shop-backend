import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import getProducts from 'src/utils/getProducts';

import schema from './schema';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  try {
    const productsList = await getProducts();
    return formatJSONResponse({
      result: productsList,
    }); 
  } catch (error) {
    return formatJSONResponse({ message: 'Unknown error.' });
  }
  
};

export const main = middyfy(getProductsList);
