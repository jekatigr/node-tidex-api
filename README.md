# node-tidex-api

> Node.js module for [Tidex](https://tidex.com) exchange api integration ([docs](https://tidex.com/exchange/public-api)).

### Installation

    yarn add node-tidex-api

### Getting started

Import the module and create a new api instance. Passing api keys is optional only if
you don't plan on doing authenticated calls.

```js
import Tidex from 'node-tidex-api';

const api = new Tidex();

// Authenticated client, can make signed calls
const api2 = Tidex({
  apiKey: 'xxx',
  apiSecret: 'xxx',
});

const markets = await api.getMarkets();
```

### Table of Contents

- [Public REST Endpoints](#public-rest-endpoints)
    - [getMarkets](#getmarkets)
    - [getTickers](#gettickers)
    - [getOrderBooks](#getorderbooks)
    - [getTrades](#gettrades)
    
- [Authenticated REST Endpoints](#authenticated-rest-endpoints)
    - [getAccountInfo](#getaccountinfo)
    - [getAccountInfoExtended](#getaccountinfoextended)
    - [limitOrder](#limitorder)
    - [getActiveOrders](#getactiveorders)
    - [getTradeHistory](#gettradehistory)
    - [getOrder](#getorder)
    - [cancelOrder](#cancelorder)
    

### Public REST Endpoints

#### getMarkets

Returns available markets. Module will serve local cache with markets after first fetch.


Example:

```js
console.log(await api.getMarkets());
```

<details>
<summary>Output</summary>

```js
[ 
    Market {
        base: 'LTC',
        quote: 'BTC',
        precision: 8,
        fee: 0.1,
        minPrice: 1e-8,
        minAmount: 0.001,
        maxPrice: 3,
        maxAmount: 1000000,
        minTotal: 0.0001 
    },
    Market {
        base: 'ETH',
        quote: 'BTC',
        precision: 8,
        fee: 0.1,
        minPrice: 1e-8,
        minAmount: 0.001,
        maxPrice: 3,
        maxAmount: 1000000,
        minTotal: 0.0001 
    },
    Market {
        base: 'DASH',
        quote: 'BTC',
        precision: 8,
        fee: 0.1,
        minPrice: 1e-8,
        minAmount: 0.001,
        maxPrice: 3,
        maxAmount: 1000000,
        minTotal: 0.0001 
    },
    ...
]
```

</details>

#### getTickers

Returns tickers for given markets.

|Param|Type|Required|Default|
|--- |--- |--- |--- |
|symbols|Array\<String\>|false|All


Example:

```js
console.log(await api.getTickers(['ETH/BTC', 'BTC/USDT']));
```

<details>
<summary>Output</summary>

```js
[ 
    Ticker {
        base: 'ETH',
        quote: 'BTC',
        ask: 0.0342154,
        bid: 0.03387898,
        last: 0.0342154,
        high: 0.03486638,
        low: 0.03200994,
        avg: 0.03343816,
        baseVolume: 41.00653576,
        quoteVolume: 1.3988951666331848 
     },
     Ticker {
        base: 'BTC',
        quote: 'USDT',
        ask: 6605.53606,
        bid: 6490.00000001,
        last: 6490,
        high: 6612.14821,
        low: 6490,
        avg: 6551.074105,
        baseVolume: 0.0164071,
        quoteVolume: 106.519590715291
    }
 ]
```

</details>

#### getOrderBooks

Returns orderbooks for given markets.

|Param|Type|Required|Default|
|--- |--- |--- |--- |
|symbols|Array\<String\>|false|All
|limit|Number|false|150


Example:

```js
console.log(await api.getOrderBooks({limit: 2, symbols: ['ETH/BTC', 'BTC/USDT']}));
```


<details>
<summary>Output</summary>

```js
[ 
    OrderBook {
        base: 'ETH',
        quote: 'BTC',
        asks: [
            Ask { price: 0.0344287, amount: 0.00416927 },
            Ask { price: 0.03442871, amount: 0.36306581 } 
        ],
        bids: [
            Bid { price: 0.03429006, amount: 19.8 },
            Bid { price: 0.03428996, amount: 2.50125062 } 
        ] 
    }, OrderBook {
        base: 'BTC',
        quote: 'USDT',
        asks: [ 
            Ask { price: 6635.13857705, amount: 0.00108004 },
            Ask { price: 6648.42847346, amount: 0.030436 } 
        ],
        bids: [ 
            Bid { price: 6550.15, amount: 0.00013106 },
            Bid { price: 6490.00000001, amount: 0.1001001 } 
        ] 
    } 
]
```

</details>

#### getTrades

Returns last trades for given markets.

|Param|Type|Required|Default|
|--- |--- |--- |--- |
|symbols|Array\<String\>|false|All
|limit|Number|false|150


Example:

```js
console.log(await api.getTrades({limit: 2, symbols: ['ETH/BTC', 'BTC/USDT']}));
```

<details>
<summary>Output</summary>

```js
[ 
    Trades {
        base: 'ETH',
        quote: 'BTC',
        trades: [ 
            Trade {
                operation: 'buy',
                amount: 0.16506953,
                price: 0.0342154,
                timestamp: 1538585177,
                orderId: undefined,
                tradeId: 25109568 
            },
            Trade {
                operation: 'buy',
                amount: 0.04733047,
                price: 0.03408376,
                timestamp: 1538585177,
                orderId: undefined,
                tradeId: 25109567 
            } 
        ] 
    },
    Trades {
        base: 'BTC',
        quote: 'USDT',
        trades: [ 
            Trade {
                operation: 'sell',
                amount: 0.0161,
                price: 6490,
                timestamp: 1538536995,
                orderId: undefined,
                tradeId: 25087685 
            },
            Trade {
                operation: 'sell',
                amount: 0.0003071,
                price: 6612.14821,
                timestamp: 1538510726,
                orderId: undefined,
                tradeId: 25076489 
            } 
        ]
    } 
 ]
```

</details>

### Authenticated REST Endpoints

#### getAccountInfo

Returns information about account.


Example:

```js
console.log(await api2.getAccountInfo());
```

<details>
<summary>Output</summary>

```js
AccountInfo {
    balances: [ 
        Balance { 
            currency: 'ETH', 
            free: 0, 
            used: 0, 
            total: 0.04003445195115 
        } 
    ],
    openOrdersCount: 0,
    rights: { 
        info: true, 
        trade: true, 
        withdraw: false 
    } 
}
```

</details>

#### getAccountInfoExtended

Returns information about account with more detail balances info.


Example:

```js
console.log(await api2.getAccountInfoExtended());
```

<details>
<summary>Output</summary>

```js
AccountInfo {
    balances: [ 
        Balance {
            currency: 'ETH',
            free: 0.04003445195115,
            used: 0,
            total: 0.04003445195115 
        } 
    ],
    openOrdersCount: 0,
    rights: { 
        info: true, 
        trade: true, 
        withdraw: false 
    } 
}
```

</details>

#### limitOrder

Create limit order.

|Param|Type|Required|Description|
|--- |--- |--- |--- |
|symbol|String|true|
|price|Number|true|
|amount|Number|true|
|operation|String|true|"buy" or "sell"


Example:

```js
console.log(await api2.limitOrder('REM/ETH', 0.00003069, 30, "buy"));
```

<details>
<summary>Output</summary>

```js
Order {
    id: 235717815,
    base: 'REM',
    quote: 'ETH',
    operation: 'buy',
    amount: 40,
    remain: 40,
    price: 0.00003069,
    created: 1538647492,
    status: 'active'
}
```
</details>

#### getActiveOrders

Returns open orders for account.

|Param|Type|Required|Default|
|--- |--- |--- |--- |
|symbol|String|false|All


Example:

```js
console.log(await api2.getActiveOrders('REM/ETH'));
```

<details>
<summary>Output</summary>

```js
[ 
    Order {
        id: 235717815,
        base: 'REM',
        quote: 'ETH',
        operation: 'buy',
        amount: 40,
        remain: 40,
        price: 0.00003069,
        created: 1538647493,
        status: 'active'
    } 
]
```

</details>

#### getTradeHistory

Returns account history of trades.

|Param|Type|Required|Description|
|--- |--- |--- |--- |
|count|String|false|trades limit 
|fromId|Number|false|value is trade id
|symbol|String|false|


Example:

```js
console.log(await api2.getTradeHistory({ symbol: 'REM/ETH' }))
```

<details>
<summary>Output</summary>

```js
[
    {
        base: "REM", 
        quote: "ETH", 
        trades: [
            {amount: 100, operation: "buy", orderId: 234224913, price: 0.00003112, timestamp: 1538405421, tradeId: 25031255}, 
            {amount: 35, operation: "buy", orderId: 234263388, price: 0.00003132, timestamp: 1538411344, tradeId: 25033988}, 
            {amount: 134.865, operation: "sell", orderId: 234263509, price: 0.00003149, timestamp: 1538493508, tradeId: 25070252}
        ]
    }
]
```

</details>

#### getOrder

Returns order information.

|Param|Type|Required|
|--- |--- |--- |
|orderId|Number|true|


Example:

```js
console.log(await api2.getOrder(234263388));
```

<details>
<summary>Output</summary>

```js
Order {
    id: 234263388,
    base: 'REM',
    quote: 'ETH',
    operation: 'buy',
    amount: 35,
    remain: 0,
    price: 0.00003132,
    created: 1538411344,
    status: 'closed' 
}
```

</details>

#### cancelOrder

Order cancellation.

|Param|Type|Required|
|--- |--- |--- |
|orderId|Number|true|


Example:

```js
console.log(await api2.cancelOrder(235717815));
```

Method returns array of Balance objects updated after order cancellation.

<details>
<summary>Output</summary>

```js
[ 
    Balance { 
        currency: 'ETH', 
        free: 0,
        used: 0,
        total: 0.04003445195115 
    }
]
```

</details>
