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

describe('getTrades', async () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { getTradesTest } = data;
    it('should return orderBooks and do not call getMarkets', async () => {
        const spy = jest.spyOn(api, 'getMarkets');
        const {
            case1: {
                source,
                expected
            }
        } = getTradesTest;

        mockRequest(true, source);

        const trades = await api.getTrades({ limit: 5, symbols: ['ETH/BTC'] });
        expect(spy).not.toHaveBeenCalled();
        expect(request).toHaveBeenCalled();

        const urlRequest = request.mock.calls[0][0].url;

        expect(urlRequest).toBe('https://api.tidex.com/api/3/trades/eth_btc?limit=5');
        expect(trades).toEqual(expected);
    });

    it('should throw error about max limit', async () => {
        const method = api.getTrades({ limit: 2001, symbols: ['BCH/ETH'] });
        await expect(method).rejects.toThrow('Max limit for trades is 2000.');
    });

    it('should call getMarkets() with empty symbols parameter', async () => {
        const {
            case3: {
                sourceForMarkets,
                sourceForTrades,
                expected
            }
        } = getTradesTest;
        api.markets = undefined;
        api.getMarkets = jest.fn().mockReturnValue(sourceForMarkets);

        mockRequest(true, sourceForTrades);

        const trades = await api.getTrades();
        expect(api.getMarkets).toHaveBeenCalled();
        expect(trades).toEqual(expected);

        api.getMarkets.mockRestore();
    });

    it('should throw error from exchange (success: 0)', async () => {
        const {
            case4: {
                source,
                expected
            }
        } = getTradesTest;

        mockRequest(true, source);

        await expect(api.getTrades({ symbols: ['BCH/ETH'] })).rejects.toThrowError(expected);
    });
});