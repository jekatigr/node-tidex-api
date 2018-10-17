jest.mock('request-promise-native');

const request = require('request-promise-native');
const TidexApi = require('../index');

const Market = require('../models/Market');

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

                const urlRequest = request.mock.calls[0][0].url;

                expect(urlRequest).toBe('https://api.tidex.com/api/3/info/');
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

        describe('getTrades', async () => {
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
    });

    describe('private api methods', () => {
        describe('getAccountInfo', () => {
            const { getAccountInfoTest } = data;
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

            it('should return correct AccountInfo object', async () => {
                const {
                    case1: {
                        source,
                        expected
                    }
                } = getAccountInfoTest;

                mockRequest(true, JSON.stringify(source));

                const accountInfo = await api.getAccountInfo();
                const signature = request.mock.calls[0][0].headers.Sign;
                const incorrectSign = !(signature) || signature === '';
                const urlRequest = request.mock.calls[0][0].url;

                expect(accountInfo).toEqual(expected);
                expect(request).toHaveBeenCalled();
                expect(urlRequest).toBe(' https://api.tidex.com/tapi');
                expect(incorrectSign).toBe(false);
            });

            it('should reject with connection error from request', async () => {
                const {
                    case2: {
                        source,
                        expected
                    }
                } = getAccountInfoTest;

                mockRequest(false, source);

                await expect(api.getAccountInfo()).rejects.toThrowError(expected);
            });

            it('should throw error from exchange (success: 0)', async () => {
                const {
                    case3: {
                        source,
                        expected
                    }
                } = getAccountInfoTest;

                mockRequest(true, JSON.stringify(source));

                await expect(api.getAccountInfo()).rejects.toThrowError(expected);
            });
        });

        describe('getAccountInfoExtended', () => {
            const { getAccountInfoExtendedTest } = data;
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

            it('should return correct AccountInfo object', async () => {
                const {
                    case1: {
                        source,
                        expected
                    }
                } = getAccountInfoExtendedTest;

                mockRequest(true, JSON.stringify(source));

                const accountInfoExtended = await api.getAccountInfoExtended();
                const signature = request.mock.calls[0][0].headers.Sign;
                const incorrectSign = !(signature) || signature === '';
                const urlRequest = request.mock.calls[0][0].url;

                expect(accountInfoExtended).toEqual(expected);
                expect(request).toHaveBeenCalled();
                expect(urlRequest).toBe(' https://api.tidex.com/tapi');
                expect(incorrectSign).toBe(false);
            });

            it('should reject with connection error from request', async () => {
                const {
                    case2: {
                        source,
                        expected
                    }
                } = getAccountInfoExtendedTest;

                mockRequest(false, source);

                await expect(api.getAccountInfoExtended()).rejects.toThrowError(expected);
            });

            it('should throw error from exchange (success: 0)', async () => {
                const {
                    case3: {
                        source,
                        expected
                    }
                } = getAccountInfoExtendedTest;

                mockRequest(true, JSON.stringify(source));

                await expect(api.getAccountInfoExtended()).rejects.toThrowError(expected);
            });
        });

        describe('limitOrder', () => {
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
    });
});