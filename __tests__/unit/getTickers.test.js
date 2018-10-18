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

describe('getTickers', () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { getTickersTest } = data;
    it('should reject with connection error from request', async () => {
        const {
            case1: {
                source,
                expected
            }
        } = getTickersTest;

        mockRequest(false, source);

        await expect(api.getTickers(['BCH/ETH'])).rejects.toThrowError(expected);
    });

    it('should throw error from exchange (success: 0)', async () => {
        const {
            case2: {
                source,
                expected
            }
        } = getTickersTest;

        mockRequest(true, source);

        await expect(api.getTickers(['BCH/ETH'])).rejects.toThrowError(expected);
    });

    it('should return tickers and do not call getMarkets', async () => {
        const {
            case4: {
                source,
                expected
            }
        } = getTickersTest;
        const spy = jest.spyOn(api, 'getMarkets');

        mockRequest(true, source);

        const tickers = await api.getTickers([ 'BCH/ETH', 'AE/ETH' ]);
        expect(spy).not.toHaveBeenCalled();
        expect(request).toHaveBeenCalled();

        const urlRequest = request.mock.calls[0][0].url;

        expect(urlRequest).toBe('https://api.tidex.com/api/3/ticker/bch_eth-ae_eth');
        expect(tickers).toEqual(expected);
    });

    it('should call getMarkets with empty symbols parameter', async () => {
        const {
            case5: {
                sourceForMarkets,
                sourceForTickers,
                expectedTickers
            }
        } = getTickersTest;
        api.markets = undefined;
        api.getMarkets = jest.fn().mockReturnValue(sourceForMarkets);

        mockRequest(true, sourceForTickers);

        const tickers = await api.getTickers();
        expect(api.getMarkets).toHaveBeenCalled();
        expect(tickers).toEqual(expectedTickers);

        api.getMarkets.mockRestore();
    });
});