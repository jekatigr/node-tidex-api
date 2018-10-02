const request = require('request-promise-native');
const crypto = require("crypto");
const querystring = require('querystring');

const Market = require('./models/Market');
const Ticker = require('./models/Ticker');
const OrderBook = require('./models/OrderBook');
const Trades = require('./models/Trades');
const Trade = require('./models/Trade');
const AccountInfo = require('./models/AccountInfo');
const Balance = require('./models/Balance');
const Order = require('./models/Order');

const PUBLIC_API_URL = 'https://api.tidex.com/api/3';
const PRIVATE_API_URL = ' https://api.tidex.com/tapi';

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

module.exports = class TidexApi {
    constructor({ apiKey, apiSecret } = {}) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;

        this.markets = undefined;
    }

    static async publicRequest(method, queryString = '') {
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
            console.log(`Exception for '${method}' method request, queryString: ${queryString}, ex: ${ex}`);
        }
    };

    static sign(key, str) {
        const hmac = crypto.createHmac("sha512", key);
        return hmac.update(new Buffer(str, 'utf-8')).digest("hex");
    }

    async privateRequest(method, params = {}) {
        try {
            const body = {
                ...params,
                method,
                nonce: params.nonce || 1
            };

            const body_converted = querystring.stringify(body);
            const signed = TidexApi.sign(this.apiSecret, body_converted);
            const res = await request({
                method: 'POST',
                url: `${PRIVATE_API_URL}`,
                headers: {
                    Connection: 'keep-alive',
                    Key: this.apiKey,
                    Sign: signed
                },
                gzip: true,
                body: body_converted
            });
            return JSON.parse(res);
        } catch (ex) {
            console.log(`Exception for private method '${method}' request, params: ${JSON.stringify(params)}, ex: ${ex}`);
        }
    }

    /**
     * Returns query string for public requests - part of uri.
     *
     * @param symbols {Array.<string>} - Array of symbol strings, for example: ['BTC/USDT', 'BTC/WEUR'].
     *
     * @returns {string} Query string, for example: 'btc_usdt-btc_weur'.
     */
    async getQueryString(symbols = []) {
        let toConvert = symbols;
        if (toConvert.length === 0) {
            let markets = await this.getMarkets();
            toConvert = markets.map(m => `${m.base}/${m.quote}`);
        }
        toConvert = toConvert.map(s => convertSymbolToTidexPairString(s));

        return toConvert.join('-');
    }

    /**
     * Returns available markets. If local markets cache not filled - fetch and save markets.
     *
     * @returns {Array.<Market>} - Array with {@Market} objects.
     */
    async getMarkets() {
        if (!this.markets) {
            const res = await TidexApi.publicRequest('info');

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
     * Return tickers for given markets.
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
        const queryString = await this.getQueryString(symbols);

        const source = await TidexApi.publicRequest('ticker', queryString);

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
     * @param {number} limit - number of order positions in asks & bids, max = 2000, default = 150
     * @param {Array.<string>} symbols - Array of markets, for example: [
     *      ETH/BTC,
     *      BTC/WEUR
     * ].
     * Orderbooks for all available markets will be received in case symbols parameter omitted.
     *
     * @returns {Array.<OrderBook>} - Array of {@OrderBook} objects, each element in asks and bids is: [0] - price, [1] - amount.
     */
    async getOrderBooks({ limit, symbols = [] } = { symbols: [] }) {
        let queryString = await this.getQueryString(symbols);

        if (limit) {
            if (limit > 2000) {
                throw new Error('Max limit for orderbook is 2000.');
            }
            queryString += `?limit=${limit}`;
        }

        const source = await TidexApi.publicRequest('depth', queryString);

        const orderBooks = [];
        for (const key of Object.keys(source)) {
            const o = source[key];
            const symbol = key.split('_');
            orderBooks.push(new OrderBook({
                base: symbol[0].toUpperCase(),
                quote: symbol[1].toUpperCase(),
                asks: o.asks,
                bids: o.bids
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
    async getTrades({ limit, symbols = [] } = { symbols: [] }) {
        let queryString = await this.getQueryString(symbols);

        if (limit) {
            if (limit > 2000) {
                throw new Error('Max limit for trades is 2000.');
            }
            queryString += `?limit=${limit}`;
        }

        const source = await TidexApi.publicRequest('trades', queryString);

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
                    timestamp: tr.timestamp
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
        const res = await this.privateRequest('getInfo');

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
        const res = await this.privateRequest('getInfoExt');

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

        const res = await this.privateRequest('Trade', {
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
     * Return open orders for account.
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
        const res = await this.privateRequest('ActiveOrders', params);

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
     * Return order information.
     *
     * @param {number} orderId - order id.
     *
     * @returns {Order} - order object.
     */
    async getOrder(orderId) {
        if (!orderId) {
            throw new Error('Order id is required for getOrder method.');
        }
        const res = await this.privateRequest('OrderInfo', { order_id: orderId });

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
     * @returns {Array.<Balance>} - array of Balance objects updated after order cancellation
     */
    async cancelOrder(orderId) {
        if (!orderId) {
            throw new Error('Order id is required for cancelOrder method.');
        }
        const res = await this.privateRequest('CancelOrder', { order_id: orderId });

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