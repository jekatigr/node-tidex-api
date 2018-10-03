module.exports = class Trade {
    constructor({ operation, amount, price, timestamp, orderId, tradeId }) {
        this.operation = operation;
        this.amount = amount;
        this.price = price;
        this.timestamp = timestamp;
        this.orderId = orderId;
        this.tradeId = tradeId
    }
};