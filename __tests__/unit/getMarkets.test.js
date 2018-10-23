jest.mock('request-promise-native');

const request = require('request-promise-native');
const TidexApi = require('../../index');

const Market = require('../../models/Market');

const data = require('./testData');

const api = new TidexApi();

function mockRequest(isResolve, response) {
    if (isResolve) {
        request.mockImplementation(async () => Promise.resolve(response));
    } else {
        request.mockImplementation(async () => Promise.reject(response));
    }
}

describe('getMarkets', () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { getMarketsTest } = data;
    it('should reject with connection error from request', async () => {
        const {
            case1: {
                source,
                expected
            }
        } = getMarketsTest;

        mockRequest(false, source);

        api.markets = undefined;
        await expect(api.getMarkets()).rejects.toThrowError(expected);
    });

    it('should throw error from exchange (success: 0)', async () => {
        const {
            case2: {
                source,
                expected
            }
        } = getMarketsTest;

        mockRequest(true, source);

        api.markets = undefined;
        await expect(api.getMarkets()).rejects.toThrowError(expected);
    });

    it('should return markets with given data and not call request with force = false', async () => {
        const {
            case3: {
                markets
            }
        } = getMarketsTest;

        mockRequest();
        api.markets = markets;

        const marketsNew = await api.getMarkets(false);
        expect(request).not.toHaveBeenCalled();
        expect(marketsNew).toEqual(markets);
    });

    it('should call request and return updated markets with given markets and force = true', async () => {
        const {
            case4: {
                markets,
                source,
                expected
            }
        } = getMarketsTest;

        mockRequest(true, source);

        api.markets = markets;
        const newMarkets = await api.getMarkets(true);
        expect(request).toHaveBeenCalled();

        expect(newMarkets).toEqual(expected);
    });

    it('should call request and return markets with markets = undefined and force = false', async () => {
        const {
            case4: {
                source,
                expected
            }
        } = getMarketsTest;

        mockRequest(true, source);
        api.markets = undefined;

        const markets = await api.getMarkets(false);
        markets.forEach(m => expect(m).toBeInstanceOf(Market));
        expect(request).toHaveBeenCalled();

        const urlRequest = request.mock.calls[0][0].url;

        expect(urlRequest).toBe('https://api.tidex.com/api/3/info/');
        expect(markets).toEqual(expected);
    });

    it('should call request and return markets with markets = undefined', async () => {
        const {
            case4: {
                source,
                expected
            }
        } = getMarketsTest;

        mockRequest(true, source);
        api.markets = undefined;

        const markets = await api.getMarkets();
        expect(request).toHaveBeenCalled();

        expect(markets).toEqual(expected);
    });

    it('should not return hidden markets', async () => {
        const {
            case5: {
                source,
                expected
            }
        } = getMarketsTest;

        mockRequest(true, source);
        api.markets = undefined;

        const markets = await api.getMarkets();
        expect(request).toHaveBeenCalled();
        expect(markets).toEqual(expected);
    });
});