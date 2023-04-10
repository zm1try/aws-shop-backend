import { expect } from '@jest/globals';
import { main as getProductsList } from './handler';
import products from '../../mocks/products';

describe('test getProductsList function', () => {
    const mockContext: any = {};
    
    it('should return products list and statusCode 200', async () => {
        const mockEvent: any = { headers: { 'Content-Type': 'text/json' } };
        const result = await getProductsList(mockEvent, mockContext);
        const { productsList: responceproductsList } = JSON.parse(result.body);
        expect(responceproductsList).toEqual(products);
        expect(result.statusCode).toBe(200);
    });
});
