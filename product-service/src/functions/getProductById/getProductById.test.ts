import { expect } from '@jest/globals';
import { main as getProductById } from './handler';
import products from '../../mocks/products';

describe('test getProductById function', () => {
    const mockContext: any = {};
    
    it('should return product and statusCode 200', async () => {
        const mockEvent: any = { pathParameters: { id: products[0].id }, headers: { 'Content-Type': 'text/json' } };
        const result = await getProductById(mockEvent, mockContext);
        const { product: responceProduct } = JSON.parse(result.body);
        expect(responceProduct).toEqual(products[0]);
        expect(result.statusCode).toBe(200);
    });

    it('should not return product and should return statusCode 404', async () => {
        const mockEvent: any = { pathParameters: { id: 1 }, headers: { 'Content-Type': 'text/json' } };
        const result = await getProductById(mockEvent, mockContext);
        const { product: responceProduct } = JSON.parse(result.body);
        expect(responceProduct).toBeUndefined;
        expect(result.statusCode).toBe(404);
    });
});
