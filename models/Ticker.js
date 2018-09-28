module.exports = class Ticker {
    constructor({ base, quote, ask, bid, last, high, low, avg, baseVolume, quoteVolume }) {
        this.base = base;
        this.quote = quote;
        this.ask = ask;
        this.bid = bid;
        this.last = last;
        this.high = high;
        this.low = low;
        this.avg = avg;
        this.baseVolume = baseVolume;
        this.quoteVolume = quoteVolume;
    }
};