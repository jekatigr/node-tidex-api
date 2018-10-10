const request = require('request-promise-native');
const crypto = require('crypto');
const querystring = require('querystring');

const Market = require('./models/Market');
const Ticker = require('./models/Ticker');
const OrderBook = require('./models/OrderBook');
const Ask = require('./models/Ask');
const Bid = require('./models/Bid');
const Trades = require('./models/Trades');
const Trade = require('./models/Trade');
const AccountInfo = require('./models/AccountInfo');
const Balance = require('./models/Balance');
const Order = require('./models/Order');

const PUBLIC_API_URL = 'https://api.tidex.com/api/3';
const PRIVATE_API_URL = ' https://api.tidex.com/tapi';

/**
 * Returns query string for public requests - part of uri.
 *
 * @param symbols {Array.<string>} - Array of symbol strings, for example: ['BTC/USDT', 'BTC/WEUR'].
 * @param markets {Array.<Market>} - Array of {@Market}. Optional.
 *
 * @returns {string} Query string, for example: 'btc_usdt-btc_weur'.
 */
const getQueryString = (symbols = [], markets) => {
    let toConvert = symbols;
    if (toConvert.length === 0) {
        toConvert = markets.map(m => `${m.base}/${m.quote}`);
    }
    toConvert = toConvert.map(s => convertSymbolToTidexPairString(s));

    return toConvert.join('-');
};

/**
 * Converts local symbol string to tidex internal market string.
 *
 * @param {string} symbol - Market, for example: 'BTC/WEUR'.
 *
 * @returns {string} market, for example: 'btc_weur'.
 */
const convertSymbolToTidexPairString = (symbol) => {
    let s = symbol.split('/');
    return `${s[0].toLowerCase()}_${s[1].toLowerCase()}`;
};

/**
 * Makes get request to public api.
 *
 * @param {string} method - public api method name.
 * @param {string} queryString - query string, part of uri.
 *
 * @returns {Object} Response object.
 */
const publicRequest = async (method, queryString = '') => {
    try {
        return await request({
            url: `${PUBLIC_API_URL}/${method}/${queryString}`,
            headers: {
                Connection: 'keep-alive'
            },
            gzip: true,
            json: true
        });
    } catch (ex) {
        throw new Error(`Exception for '${method}' method request, queryString: ${queryString}, ex: ${ex}`);
    }
};

/**
 * Sign body parameters for private requests.
 *
 * @param key - secret key.
 * @param str - string which will be signed.
 *
 * @returns {string} Signed string.
 */
const sign = (key, str) => {
    const hmac = crypto.createHmac("sha512", key);
    return hmac.update(new Buffer(str, 'utf-8')).digest("hex");
};

/**
 * Makes post request to private api.
 *
 * @param {string} apiKey - string with api key.
 * @param {string} apiSecret - string with api secret.
 * @param {string} method - private api method name.
 * @param {Object} params - object with request parameters.
 *
 * @returns {Object} Response object.
 */
const privateRequest = async (apiKey, apiSecret, method, params = {}) => {
    try {
        const body = {
            ...params,
            method,
            nonce: params.nonce || 1
        };

        const body_converted = querystring.stringify(body);
        const signed = sign(apiSecret, body_converted);
        const res = await request({
            method: 'POST',
            url: `${PRIVATE_API_URL}`,
            headers: {
                Connection: 'keep-alive',
                Key: apiKey,
                Sign: signed
            },
            gzip: true,
            body: body_converted
        });
        return JSON.parse(res);
    } catch (ex) {
        throw new Error(`Exception for private method '${method}' request, params: ${JSON.stringify(params)}, ex: ${ex}`);
    }
};

module.exports = class TidexApi {
    constructor({ apiKey = undefined, apiSecret = undefined } = {}) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;

        this.markets = undefined;
    }

    /**
     * Returns available markets. If local markets cache not filled - fetch and save markets.
     *
     * @returns {Array.<Market>} - Array with {@Market} objects.
     */
    async getMarkets() {
        if (!this.markets) {
            const res = await publicRequest('info');

            if (res.hasOwnProperty('success') && res.success === 0) {
                throw new Error(res.error);
            }

            const { pairs } = res;

            const markets = [];

            for (const key of Object.keys(pairs)) {
                const m = pairs[key];
                if (m.hidden !== 1) {
                    const symbol = key.split('_');
                    markets.push(new Market({
                        base: symbol[0].toUpperCase(),
                        quote: symbol[1].toUpperCase(),
                        precision: m.decimal_places,
                        fee: m.fee,
                        minPrice: m.min_price,
                        minAmount: m.min_amount,
                        maxPrice: m.max_price,
                        maxAmount: m.max_amount,
                        minTotal: m.min_total
                    }));
                }
            }

            this.markets = markets;
        }
        return this.markets;
    }

    /**
     * Returns tickers for given markets.
     *
     * @param symbols Array of markets, for example: [
     *      ETH/BTC,
     *      BTC/WEUR
     * ].
     * All available tickers will be received in case symbols parameter omitted.
     *
     * @returns {Array.<Ticker>} array with tickers.
     */
    async getTickers(symbols = []) {
        const queryString = getQueryString(symbols, (symbols.length === 0) ? await this.getMarkets(): undefined);

        const source = await publicRequest('ticker', queryString);

        if (source.hasOwnProperty('success') && source.success === 0) {
            throw new Error(source.error);
        }

        const tickers = [];
        for (const key of Object.keys(source)) {
            const t = source[key];
            const symbol = key.split('_');
            tickers.push(new Ticker({
                base: symbol[0].toUpperCase(),
                quote: symbol[1].toUpperCase(),
                ask: t.sell,
                bid: t.buy,
                last: t.last,
                high: t.high,
                low: t.low,
                avg: t.avg,
                baseVolume: t.vol_cur,
                quoteVolume: t.vol
            }));
        }

        return tickers;
    }

    /**
     * Return orderbooks for given markets.
     *
     * @param {number} limit - Optional. Number of order positions in asks & bids, max = 2000, default = 150
     * @param {Array.<string>} symbols - Optional. Array of markets, for example: [
     *      ETH/BTC,
     *      BTC/WEUR
     * ].
     * Orderbooks for all available markets will be received in case symbols parameter omitted.
     *
     * @returns {Array.<OrderBook>} - Array of {@OrderBook} objects, each element in asks array - {@Ask}, in bids - {@Bid}.
     */
    async getOrderBooks({ limit = undefined, symbols = [] } = { symbols: [] }) {
        let queryString = getQueryString(symbols, (symbols.length === 0) ? await this.getMarkets(): undefined);

        if (limit) {
            if (limit > 2000) {
                throw new Error('Max limit for orderbook is 2000.');
            }
            queryString += `?limit=${limit}`;
        }

        const source = await publicRequest('depth', queryString);

        if (source.hasOwnProperty('success') && source.success === 0) {
            throw new Error(source.error);
        }

        const orderBooks = [];
        for (const key of Object.keys(source)) {
            const o = source[key];
            const symbol = key.split('_');

            const asks = (o.asks || []).map(a => new Ask({price: a[0], amount: a[1]}));
            const bids = (o.bids || []).map(b => new Bid({price: b[0], amount: b[1]}));

            orderBooks.push(new OrderBook({
                base: symbol[0].toUpperCase(),
                quote: symbol[1].toUpperCase(),
                asks,
                bids
            }));
        }

        return orderBooks;
    }

    /**
     * Return last trades for given markets.
     *
     * @param {number} limit - number of trades, max = 2000, default = 150
     * @param Array.<string>} symbols - Array of markets, for example: [
     *      ETH/BTC,
     *      BTC/WEUR
     * ].
     * Trades for all available markets will be received in case symbols parameter omitted.
     *
     * @returns {Array.<Trades>} - Array of {@Trades} objects.
     */
    async getTrades({ limit = undefined, symbols = [] } = { symbols: [] }) {
        let queryString = getQueryString(symbols, (symbols.length === 0) ? await this.getMarkets(): undefined);

        if (limit) {
            if (limit > 2000) {
                throw new Error('Max limit for trades is 2000.');
            }
            queryString += `?limit=${limit}`;
        }

        const source = await publicRequest('trades', queryString);

        if (source.hasOwnProperty('success') && source.success === 0) {
            throw new Error(source.error);
        }

        const trades = [];
        for (const key of Object.keys(source)) {
            const t = source[key];
            const symbol = key.split('_');

            const tradesArray = [];

            t.forEach(tr => {
                tradesArray.push(new Trade({
                    operation: tr.type === "ask" ? 'sell' : 'buy',
                    amount: tr.amount,
                    price: tr.price,
                    timestamp: tr.timestamp,
                    tradeId: tr.tid
                }));
            });

            trades.push(new Trades({
                base: symbol[0].toUpperCase(),
                quote: symbol[1].toUpperCase(),
                trades: tradesArray
            }));
        }

        return trades;
    }

    /**
     * Return information about account. Balances WILL NOT be separated on 'free' and 'used'.
     *
     * @returns {AccountInfo} - information object.
     */
    async getAccountInfo() {
        const res = await privateRequest(this.apiKey, this.apiSecret, 'getInfo');

        if (res.success) {
            const funds = res.return.funds;
            const balances = [];

            for (const key of Object.keys(funds)) {
                if (funds[key] > 0) {
                    balances.push(new Balance({
                        currency: key.toUpperCase(),
                        total: funds[key]
                    }));
                }
            }

            return new AccountInfo({
                balances,
                openOrdersCount: res.return.open_orders,
                rights: res.return.rights
            });
        } else {
            throw new Error(`Error from exchange, error: '${res.error}'`);
        }
    }

    /**
     * Return information about account. Balances will be separated on 'free' and 'used'.
     *
     * @returns {AccountInfo} - information object.
     */
    async getAccountInfoExtended() {
        const res = await privateRequest(this.apiKey, this.apiSecret, 'getInfoExt');

        if (res.success) {
            const funds = res.return.funds;
            const balances = [];

            for (const key of Object.keys(funds)) {
                const { value, inOrders } = funds[key];
                if (value > 0 || inOrders > 0) {
                    balances.push(new Balance({
                        currency: key.toUpperCase(),
                        free: value,
                        used: inOrders
                    }));
                }
            }

            return new AccountInfo({
                balances,
                openOrdersCount: res.return.open_orders,
                rights: res.return.rights
            });
        } else {
            throw new Error(`Error from exchange, error: '${res.error}'`);
        }
    }

    /**
     * Create limit order.
     *
     * @param {string} symbol - Market, for example: 'LTC/ETH'.
     * @param {number} price - Price.
     * @param {number} amount - Amount.
     * @param {string} operation - Operation: 'buy' or 'sell'.
     *
     * @returns {Order} - {@Order} object.
     */
    async limitOrder(symbol, price, amount, operation) {
        let market;
        let base, quote;
        if (!symbol) {
            throw new Error('Symbol is required for limitOrder method.');
        } else {
            [ base, quote ] = symbol.split('/');
            const markets = await this.getMarkets();
            market = markets.find(m => m.base === base && m.quote === quote);
            if (!market) {
                throw new Error('Market with such symbol doesn\'t exist.');
            }
        }

        if (operation !== 'buy' && operation !== 'sell') {
            throw new Error(`Operation should be 'buy' or 'sell'.`);
        }

        if (!price) {
            throw new Error('Price is required for limitOrder method.');
        } else {
            if (price > market.maxPrice) {
                throw new Error(`Price should be less than '${market.maxPrice}' for ${symbol} market.`);
            }
            if (price < market.minPrice) {
                throw new Error(`Price should be greater than '${market.minPrice}' for ${symbol} market.`);
            }
        }

        if (!amount) {
            throw new Error('Amount is required for limitOrder method.');
        } else {
            if (amount > market.maxAmount) {
                throw new Error(`Amount should be less than '${market.maxAmount}' for ${symbol} market.`);
            }
            if (amount < market.minAmount) {
                throw new Error(`Amount should be greater than '${market.minAmount}' for ${symbol} market.`);
            }
        }

        if (price * amount < market.minTotal) {
            throw new Error(`Total should be greater than '${market.minTotal}' for ${symbol} market. Current total: ${ price * amount }`);
        }

        const res = await privateRequest(this.apiKey, this.apiSecret, 'Trade', {
            pair: convertSymbolToTidexPairString(symbol),
            type: operation,
            rate: price,
            amount
        });

        if (res.success) {
            const orderRaw = res.return;
            const { init_order_id, order_id, received, remains } = orderRaw;

            let status = 'active';
            if (order_id === 0 || remains === 0) {
                status = 'closed';
            }

            return new Order({
                id: init_order_id,
                base,
                quote,
                operation,
                amount: received + remains,
                remain: remains,
                price,
                created: +(+new Date() / 1000).toFixed(0),
                status
            });
        } else {
            throw new Error(`Error from exchange, error: '${res.error}'`);
        }
    }

    /**
     * Returns open orders for account.
     *
     * @param {string} symbol - Market, for example: 'LTC/ETH'.
     * All open orders will be received in case symbol parameter omitted.
     *
     * @returns {Array.<Order>} - array of open orders.
     */
    async getActiveOrders(symbol) {
        let params;
        if (symbol) {
            params = { pair: convertSymbolToTidexPairString(symbol) }
        }
        const res = await privateRequest(this.apiKey, this.apiSecret, 'ActiveOrders', params);

        if (res.success) {
            const orders = res.return;
            const activeOrders = [];

            for (const key of Object.keys(orders)) {
                const { pair, type, amount, rate, timestamp_created } = orders[key];
                const symbol = pair.split('_');
                activeOrders.push(new Order({
                    id: +key,
                    base: symbol[0].toUpperCase(),
                    quote: symbol[1].toUpperCase(),
                    operation: type,
                    amount,
                    price: rate,
                    created: timestamp_created,
                    status: 'active'
                }));
            }

            return activeOrders;
        } else {
            throw new Error(`Error from exchange, error: '${res.error}'`);
        }
    }

    /**
     * Returns account history of trades.
     *
     * @param {number} count - The number of trades for display. Optional.
     * @param {number} fromId - Trade ID, from which the display starts. Optional.
     * @param {string} symbol - Market, for example: 'LTC/ETH'. Optional.
     *
     * @returns {Array.<Trades>} - array of trade history.
     */
    async getTradeHistory({ count = undefined, fromId = undefined, symbol = undefined } = {}) {
        let params = {};
        if (count !== undefined) params.count = count;
        if (fromId !== undefined) params.from_id = fromId;
        if (symbol !== undefined) params.pair = convertSymbolToTidexPairString(symbol);

        const res = await privateRequest(this.apiKey, this.apiSecret,'TradeHistory', params);

        if (res.success) {
            const source = res.return;
            let tradesOfPair = {};
            let allPairList = [];
            for (const key of Object.keys(source)) {
                let { amount, order_id, pair, rate, timestamp, trade_id, type } = source[key];
                const trade = new Trade({
                    operation: type,
                    amount,
                    price: rate,
                    timestamp,
                    orderId: order_id,
                    tradeId: trade_id
                });

                if (allPairList.indexOf(pair) === -1) {
                    allPairList.push(pair);
                    tradesOfPair[pair] = [];
                }
                tradesOfPair[pair].push(trade);
            }

            let tradeHistory = [];
            for (const pair of Object.keys(tradesOfPair)) {
                const symbol = pair.split('_');
                const trades = new Trades({
                    base: symbol[0].toUpperCase(),
                    quote: symbol[1].toUpperCase(),
                    trades: tradesOfPair[pair]
                });
                tradeHistory.push(trades);
            }
            return tradeHistory;
        } else {
            throw new Error(`Error from exchange, error: '${res.error}'`);
        }
    }

    /**
     * Returns order information.
     *
     * @param {number} orderId - order id.
     *
     * @returns {Order} - order object.
     */
    async getOrder(orderId) {
        if (!orderId) {
            throw new Error('Order id is required for getOrder method.');
        }
        const res = await privateRequest(this.apiKey, this.apiSecret, 'OrderInfo', { order_id: orderId });

        if (res.success) {
            const orderRaw = res.return;
            const [ id ] = Object.keys(orderRaw);
            const { pair, type, start_amount, amount, rate, timestamp_created, status } = orderRaw[id];

            let statusStr;
            switch (status) {
                case 0: { statusStr = 'active'; break; }
                case 1: { statusStr = 'closed'; break; }
                case 2: { statusStr = 'cancelled'; break; }
                case 3: { statusStr = 'cancelled_partially'; break; }
            }

            const symbol = pair.split('_');
            return new Order({
                id: +id,
                base: symbol[0].toUpperCase(),
                quote: symbol[1].toUpperCase(),
                operation: type,
                amount: start_amount,
                remain: amount,
                price: rate,
                created: timestamp_created,
                status: statusStr
            });
        } else {
            throw new Error(`Error from exchange, error: '${res.error}'`);
        }
    }

    /**
     * Order cancellation.
     *
     * @param {number} orderId - order id.
     *
     * @returns {Array.<Balance>} - array of {@Balance} objects updated after order cancellation
     */
    async cancelOrder(orderId) {
        if (!orderId) {
            throw new Error('Order id is required for cancelOrder method.');
        }
        const res = await privateRequest(this.apiKey, this.apiSecret, 'CancelOrder', { order_id: orderId });

        if (res.success) {
            const funds = res.return.funds;
            const balances = [];

            for (const key of Object.keys(funds)) {
                if (funds[key] > 0) {
                    balances.push(new Balance({
                        currency: key.toUpperCase(),
                        total: funds[key]
                    }));
                }
            }

            return balances;
        } else {
            throw new Error(`Error from exchange, error: '${res.error}'`);
        }
    }
};