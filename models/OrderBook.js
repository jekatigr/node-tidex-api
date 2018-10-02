module.exports = class OrderBook {
    constructor({ base, quote, asks, bids }) {
        this.base = base;
        this.quote = quote;
        this.asks = asks;
        this.bids = bids;
    }
};