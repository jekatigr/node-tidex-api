jest.mock('request-promise-native');

const request = require('request-promise-native');
const TidexApi = require('../index');

const Market = require('../models/Market');

const data = require('./testData');

const api = new TidexApi();

function mockRequest(isResolve, response) {
    if (isResolve) {
        request.mockImplementation(async () => Promise.resolve(response));
    } else {
        request.mockImplementation(async () => Promise.reject(response));
    }
}

describe('Tidex', () => {
    afterEach(() => {
        request.mockRestore();
    });

    describe('public api methods', () => {
        describe('getMarkets', () => {
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

            it('should return markets with given data and not call request', async () => {
                const {
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
                const {
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

        describe('getTickers', () => {
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

        describe('getOrderBooks', async () => {
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

                const orderBooks = await api.getOrderBooks({ symbols: ['ETH/BTC'] });
                expect(spy).not.toHaveBeenCalled();
                expect(request).toHaveBeenCalled();
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
    });
});