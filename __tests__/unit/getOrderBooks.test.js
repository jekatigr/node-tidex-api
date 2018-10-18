jest.mock('request-promise-native');

const request = require('request-promise-native');
const TidexApi = require('../../index');

const data = require('./testData');

const api = new TidexApi();

function mockRequest(isResolve, response) {
    if (isResolve) {
        request.mockImplementation(async () => Promise.resolve(response));
    } else {
        request.mockImplementation(async () => Promise.reject(response));
    }
}

describe('getOrderBooks', async () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { getOrderBooksTest } = data;
    it('should return orderBooks and do not call getMarkets', async () => {
        const spy = jest.spyOn(api, 'getMarkets');
        const {
            case1: {
                source,
                expected
            }
        } = getOrderBooksTest;

        mockRequest(true, source);

        const orderBooks = await api.getOrderBooks({ limit: 5, symbols: ['ETH/BTC'] });
        expect(spy).not.toHaveBeenCalled();
        expect(request).toHaveBeenCalled();

        const urlRequest = request.mock.calls[0][0].url;

        expect(urlRequest).toBe('https://api.tidex.com/api/3/depth/eth_btc?limit=5');
        expect(orderBooks).toEqual(expected);
    });

    it('should throw error about max limit', async () => {
        const method = api.getOrderBooks({ limit: 2001, symbols: ['BCH/ETH'] });
        await expect(method).rejects.toThrow('Max limit for orderbook is 2000.');
    });

    it('should call getMarkets() with empty symbols parameter', async () => {
        const {
            case3: {
                sourceForMarkets,
                sourceForOrderBooks,
                expected
            }
        } = getOrderBooksTest;
        api.markets = undefined;
        api.getMarkets = jest.fn().mockReturnValue(sourceForMarkets);

        mockRequest(true, sourceForOrderBooks);

        const orderBooks = await api.getOrderBooks();
        expect(api.getMarkets).toHaveBeenCalled();
        expect(orderBooks).toEqual(expected);

        api.getMarkets.mockRestore();
    });

    it('should throw error from exchange (success: 0)', async () => {
        const {
            case4: {
                source,
                expected
            }
        } = getOrderBooksTest;

        mockRequest(true, source);

        await expect(api.getOrderBooks({ symbols: ['BCH/ETH'] })).rejects.toThrowError(expected);
    });
});