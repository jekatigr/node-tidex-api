jest.mock('request-promise-native');

const TidexApi = require('../index');
let request = require('request-promise-native');

const Market = require('../models/Market');

const data = require('./testData');

const api = new TidexApi();

function mockRequest(isResolve,response) {
    if (isResolve) {
        request.mockImplementation(async () => Promise.resolve(response));
    } else {
        request.mockImplementation(async () => Promise.reject(response));
    }
}

describe('Tidex', () => {
    afterEach(() => {
        request.mockRestore()
    });

    describe('public api methods', () => {
        describe('getMarkets', () => {
            const { getMarketsTest } = data;
            it('should reject with connection error from request', async () => {
                let {
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
                let {
                    case2: {
                        source,
                        expected
                    }
                } = getMarketsTest;

                mockRequest(true, source);

                api.markets = undefined;
                await expect(api.getMarkets()).rejects.toThrowError(expected);
            });

            it('should return markets with given data and not call request', async () => {
                let {
                    case3: {
                        markets
                    }
                } = getMarketsTest;

                mockRequest();
                api.markets = markets;

                const marketsNew = await api.getMarkets();
                expect(request).not.toHaveBeenCalled();
                expect(marketsNew).toEqual(markets);
            });

            it('should return markets with given data and call request', async () => {
                let {
                    case4: {
                        source,
                        expected
                    }
                } = getMarketsTest;

                mockRequest(true, source);
                api.markets = undefined;

                const markets = await api.getMarkets();
                markets.forEach(m => expect(m).toBeInstanceOf(Market));
                expect(request).toHaveBeenCalled();
                expect(markets).toEqual(expected);
            });

            it('should not return hidden markets', async () => {
                let {
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

        describe('getTickers', () => {
            const { getTickersTest } = data;
            it('should reject with connection error from request', async () => {
                let {
                    case1: {
                        source,
                        expected
                    }
                } = getTickersTest;

                mockRequest(false, source);

                await expect(api.getTickers([ 'BCH/ETH' ])).rejects.toThrowError(expected);
            });

            it('should throw error from exchange (success: 0)', async () => {
                let {
                    case2: {
                        source,
                        expected
                    }
                } = getTickersTest;

                mockRequest(true, source);

                await expect(api.getTickers([ 'BCH/ETH' ])).rejects.toThrowError(expected);
            });

            it('should return tickers and do not call getMarkets', async () => {
                let {
                    case4: {
                        source,
                        expected
                    }
                } = getTickersTest;
                const spy = jest.spyOn(api, 'getMarkets');

                mockRequest(true, source);

                const tickers = await api.getTickers([ 'BCH/ETH', 'AE/ETH' ]);
                expect(spy).not.toHaveBeenCalled();
                expect(tickers).toEqual(expected);
            });

            it('should call getMarkets with empty symbols parameter', async () => {
                let {
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

        describe('getOrderBooks', async () => {
            const { getOrderBooksTest } = data;
            it('should do not call method getMarkets()', async () => {
                const spy = jest.spyOn(api, 'getMarkets');
                let {
                    case1: {
                        source
                    }
                } = getOrderBooksTest;

                mockRequest(true, source);

                await api.getOrderBooks({symbols: ['ETH/BTC']});
                expect(spy).not.toHaveBeenCalled();
            })
        })
    });
});