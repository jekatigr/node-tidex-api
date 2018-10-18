jest.mock('request-promise-native');

const request = require('request-promise-native');
const TidexApi = require('../../index');

const data = require('./testData');

const api = new TidexApi({
    apiKey: 'sdfsdf',
    apiSecret: 'sdfdsf34'
});

function mockRequest(isResolve, response) {
    if (isResolve) {
        request.mockImplementation(async () => Promise.resolve(response));
    } else {
        request.mockImplementation(async () => Promise.reject(response));
    }
}

async function emptyApiKey(method) {
    await expect(method()).rejects.toThrowError('Missing apiKey property for private api request');
}

async function emptyApiSecret(method) {
    await expect(method()).rejects.toThrowError('Missing apiSecret property for private api request');
}

describe('limitOrder', () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { limitOrderTest } = data;
    const {
        case1: {
            sourceForGetMarkets
        }
    } = limitOrderTest;

    it('should throw error about empty apiKey', async () => {
        api.apiKey = '';
        await emptyApiKey(api.limitOrder.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about undefined apiKey', async () => {
        api.apiKey = undefined;
        await emptyApiKey(api.limitOrder.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about empty apiSecret', async () => {
        api.apiSecret = '';
        await emptyApiSecret(api.limitOrder.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should throw error about undefined apiSecret', async () => {
        api.apiSecret = undefined;
        await emptyApiSecret(api.limitOrder.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should throw error about required symbol', async () => {
        const method = api.limitOrder('', 40000, 90, 'buy');
        await expect(method).rejects.toThrowError('Symbol is required for limitOrder method.');
    });

    it('should throw error about  doesn\'t exist such symbol', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('MER/WAVES', 4000, 90, 'buy');
        await expect(method).rejects.toThrowError('Market with such symbol doesn\'t exist.');

        api.getMarkets.mockRestore();
    });

    it('should throw error about not \'buy\' or \'sell\'', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('LTC/BTC', 4000, 90, '');
        await expect(method).rejects.toThrowError('Operation should be "buy" or "sell".');

        api.getMarkets.mockRestore();
    });

    it('should throw error about price is required', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('LTC/BTC', undefined, 90, 'sell');
        await expect(method).rejects.toThrowError('Price is required for limitOrder method.');

        api.getMarkets.mockRestore();
    });

    it('should throw error about price which less than market.maxPrice', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('LTC/BTC', 5, 90, 'sell');
        await expect(method).rejects.toThrowError('Price should be less than \'3\' for LTC/BTC market.');

        api.getMarkets.mockRestore();
    });

    it('should throw error about price which greater than market.minPrice', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('LTC/BTC', 0.0007, 90, 'sell');
        await expect(method).rejects.toThrowError('Price should be greater than \'0.2\' for LTC/BTC market.');

        api.getMarkets.mockRestore();
    });

    it('should throw error about amount is required', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('LTC/BTC', 1, undefined, 'sell');
        await expect(method).rejects.toThrowError('Amount is required for limitOrder method.');

        api.getMarkets.mockRestore();
    });

    it('should throw error about amount must be less than market.maxAmount', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('LTC/BTC', 1, 2000000, 'sell');
        await expect(method).rejects.toThrowError('Amount should be less than \'1000000\' for LTC/BTC market.');

        api.getMarkets.mockRestore();
    });

    it('should throw error about amount must be greater than market.minAmount', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('LTC/BTC', 1, 0.003, 'sell');
        await expect(method).rejects.toThrowError('Amount should be greater than \'0.1\' for LTC/BTC market.');

        api.getMarkets.mockRestore();
    });

    it('should throw error about total must be greater than market.minTotal', async () => {
        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        const method = api.limitOrder('LTC/BTC', 2, 100, 'sell');
        await expect(method).rejects.toThrowError('Total should be greater than \'250\' for LTC/BTC market. Current total: 200');

        api.getMarkets.mockRestore();
    });

    it('should throw error from exchange (success: 0, error: \'Not enougth ETH to create buy order.\')', async () => {
        const {
            case2: {
                source,
                expected
            }
        } = limitOrderTest;

        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarkets);

        mockRequest(true, JSON.stringify(source));

        const method = api.limitOrder('LTC/BTC', 2, 200, 'sell');

        await expect(method).rejects.toThrowError(expected);
    });

    it('should return correct Order object', async () => {
        const {
            case3: {
                sourceForGetMarket,
                source,
                expected
            }
        } = limitOrderTest;

        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarket);
        mockRequest(true, JSON.stringify(source));

        const limitOrder = await api.limitOrder('REM/ETH', 0.00000102, 39281.9405, 'buy');
        delete limitOrder.created;
        const signature = request.mock.calls[0][0].headers.Sign;
        const incorrectSign = !(signature) || signature === '';
        const urlRequest = request.mock.calls[0][0].url;

        expect(limitOrder).toEqual(expected);
        expect(request).toHaveBeenCalled();
        expect(urlRequest).toBe(' https://api.tidex.com/tapi');
        expect(incorrectSign).toBe(false);
    });

    it('should return correct Order object when orderId === 0', async () => {
        const {
            case4: {
                sourceForGetMarket,
                source,
                expected
            }
        } = limitOrderTest;

        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarket);
        mockRequest(true, JSON.stringify(source));

        const limitOrder = await api.limitOrder('REM/ETH', 0.00000102, 39281.9405, 'buy');
        delete limitOrder.created;

        expect(limitOrder).toEqual(expected);
    });

    it('should return correct Order object when remains === 0', async () => {
        const {
            case5: {
                sourceForGetMarket,
                source,
                expected
            }
        } = limitOrderTest;

        api.getMarkets = jest.fn().mockReturnValue(sourceForGetMarket);
        mockRequest(true, JSON.stringify(source));

        const limitOrder = await api.limitOrder('REM/ETH', 0.00000102, 39281.9405, 'buy');
        delete limitOrder.created;

        expect(limitOrder).toEqual(expected);
    });
});