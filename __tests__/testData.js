module.exports = {
    getMarketsTest: {
        case1: {
            source: Error('some error'),
            expected: 'Exception for \'info\' method request, queryString: , ex: Error: some error'
        },
        case2: {
            source: {
                success: 0,
                error: 'Invalid pair name: btc_eth'
            },
            expected: 'Invalid pair name: btc_eth'
        },
        case3: {
            markets: [
                {
                    base: 'ETH',
                    quote: 'BTC',
                    precision: 3,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 400,
                    maxAmount: 1000000,
                    minTotal: 0.0001
                },
                {
                    base: 'AE',
                    quote: 'ETH',
                    precision: 8,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 100,
                    maxAmount: 2000000,
                    minTotal: 0.0002
                }]
        },
        case4: {
            source: {
                server_time: 1370814956,
                pairs: {
                    eth_btc: {
                        decimal_places: 3,
                        min_price: 0.1,
                        max_price: 400,
                        min_amount: 0.01,
                        hidden: 0,
                        fee: 0.2,
                        max_amount: 1000000,
                        min_total: 0.0001
                    },
                    ae_eth: {
                        decimal_places: 8,
                        min_price: 0.1,
                        max_price: 100,
                        min_amount: 0.01,
                        hidden: 0,
                        fee: 0.2,
                        max_amount: 2000000,
                        min_total: 0.0002
                    }
                }
            },
            expected: [
                {
                    base: 'ETH',
                    quote: 'BTC',
                    precision: 3,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 400,
                    maxAmount: 1000000,
                    minTotal: 0.0001
                },
                {
                    base: 'AE',
                    quote: 'ETH',
                    precision: 8,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 100,
                    maxAmount: 2000000,
                    minTotal: 0.0002
                }]
        },
        case5: {
            source: {
                server_time: 1370814956,
                pairs: {
                    eth_btc: {
                        decimal_places: 3,
                        min_price: 0.1,
                        max_price: 400,
                        min_amount: 0.01,
                        hidden: 1,
                        fee: 0.2,
                        max_amount: 1000000,
                        min_total: 0.0001
                    },
                    ae_eth: {
                        decimal_places: 8,
                        min_price: 0.1,
                        max_price: 100,
                        min_amount: 0.01,
                        hidden: 0,
                        fee: 0.2,
                        max_amount: 2000000,
                        min_total: 0.0002
                    }
                }
            },
            expected: [
                {
                    base: 'AE',
                    quote: 'ETH',
                    precision: 8,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 100,
                    maxAmount: 2000000,
                    minTotal: 0.0002
                }
            ]
        }
    },
    getTickersTest: {
        case1: {
            source: Error('some error'),
            expected: 'Exception for \'ticker\' method request, queryString: bch_eth, ex: Error: some error'
        },
        case2: {
            source: {
                success: 0,
                error: 'Invalid pair name: btc_eth'
            },
            expected: 'Invalid pair name: btc_eth'
        },
        case3: {
            source:
                {
                    eth_btc: {
                        high: 0.07161592,
                        low: 0.06892569,
                        avg: 0.070270805,
                        vol: 103.2840945024957623,
                        vol_cur: 1464.62728575,
                        last: 0.06982246,
                        buy: 0.06951214,
                        sell: 0.07020298,
                        updated: 1505065597
                    },
                    ae_eth: {
                        high: 0.071615356,
                        low: 0.08756478,
                        avg: 0.070270805,
                        vol: 103.2840945024957623,
                        vol_cur: 1464.62728575,
                        last: 0.06982246,
                        buy: 0.06951214,
                        sell: 0.07020298,
                        updated: 2205065597
                    }
                }
        },
        case4: {
            source:
                {
                    eth_btc: {
                        high: 0.07161592,
                        low: 0.06892569,
                        avg: 0.070270805,
                        vol: 103.2840945024957623,
                        vol_cur: 1464.62728575,
                        last: 0.06982246,
                        buy: 0.06951214,
                        sell: 0.07020298,
                        updated: 1505065597
                    },
                    ae_eth: {
                        high: 0.071615356,
                        low: 0.08756478,
                        avg: 0.070270805,
                        vol: 103.2840945024957623,
                        vol_cur: 1464.62728575,
                        last: 0.06982246,
                        buy: 0.06951214,
                        sell: 0.07020298,
                        updated: 2205065597
                    }
                },
            expected: [
                {
                    base: 'ETH',
                    quote: 'BTC',
                    ask: 0.07020298,
                    bid: 0.06951214,
                    last: 0.06982246,
                    high: 0.07161592,
                    low: 0.06892569,
                    avg: 0.070270805,
                    baseVolume: 1464.62728575,
                    quoteVolume: 103.28409450249576
                },
                {
                    base: 'AE',
                    quote: 'ETH',
                    ask: 0.07020298,
                    bid: 0.06951214,
                    last: 0.06982246,
                    high: 0.071615356,
                    low: 0.08756478,
                    avg: 0.070270805,
                    baseVolume: 1464.62728575,
                    quoteVolume: 103.28409450249576
                }
            ]
        },
        case5: {
            sourceForTickers: {
                eth_btc: {
                    high: 0.07161592,
                    low: 0.06892569,
                    avg: 0.070270805,
                    vol: 103.2840945024957623,
                    vol_cur: 1464.62728575,
                    last: 0.06982246,
                    buy: 0.06951214,
                    sell: 0.07020298,
                    updated: 1505065597
                },
                ae_eth: {
                    high: 0.071615356,
                    low: 0.08756478,
                    avg: 0.070270805,
                    vol: 103.2840945024957623,
                    vol_cur: 1464.62728575,
                    last: 0.06982246,
                    buy: 0.06951214,
                    sell: 0.07020298,
                    updated: 2205065597
                }
            },
            sourceForMarkets: [
                {
                    base: 'ETH',
                    quote: 'BTC',
                    precision: 3,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 400,
                    maxAmount: 1000000,
                    minTotal: 0.0001
                },
                {
                    base: 'AE',
                    quote: 'ETH',
                    precision: 8,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 100,
                    maxAmount: 2000000,
                    minTotal: 0.0002
                }],
            expectedTickers: [
                {
                    ask: 0.07020298,
                    avg: 0.070270805,
                    base: 'ETH',
                    baseVolume: 1464.62728575,
                    bid: 0.06951214,
                    high: 0.07161592,
                    last: 0.06982246,
                    low: 0.06892569,
                    quote: 'BTC',
                    quoteVolume: 103.28409450249576
                },
                {
                    ask: 0.07020298,
                    avg: 0.070270805,
                    base: 'AE',
                    baseVolume: 1464.62728575,
                    bid: 0.06951214,
                    high: 0.071615356,
                    last: 0.06982246,
                    low: 0.08756478,
                    quote: 'ETH',
                    quoteVolume: 103.28409450249576
                }
            ]
        }
    },
    getOrderBooksTest: {
        case1: {
            source: {
                eth_btc: {
                    asks: [
                        [ 103.426, 0.01 ],
                        [ 103.5, 15 ],
                        [ 103.504, 0.425 ],
                        [ 103.505, 0.1 ]
                    ],
                    bids: [
                        [ 103.2, 2.48502251 ],
                        [ 103.082, 0.46540304 ],
                        [ 102.91, 0.99007913 ],
                        [ 102.83, 0.07832332 ]
                    ]
                }
            },
            expected: [
                { asks:
                        [
                            { amount: 0.01, price: 103.426 },
                            { amount: 15, price: 103.5 },
                            { amount: 0.425, price: 103.504 },
                            { amount: 0.1, price: 103.505 }
                        ],
                base: 'ETH',
                bids:
                        [
                            { amount: 2.48502251, price: 103.2 },
                            { amount: 0.46540304, price: 103.082 },
                            { amount: 0.99007913, price: 102.91 },
                            { amount: 0.07832332, price: 102.83 }
                        ],
                quote: 'BTC' }
            ]
        },
        case3: {
            sourceForMarkets: [
                {
                    base: 'ETH',
                    quote: 'BTC',
                    precision: 3,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 400,
                    maxAmount: 1000000,
                    minTotal: 0.0001
                }
            ],
            sourceForOrderBooks: {
                eth_btc: {
                    asks: [
                        [ 103.426, 0.01 ],
                        [ 103.5, 15 ],
                        [ 103.504, 0.425 ],
                        [ 103.505, 0.1 ]
                    ],
                    bids: [
                        [ 103.2, 2.48502251 ],
                        [ 103.082, 0.46540304 ],
                        [ 102.91, 0.99007913 ],
                        [ 102.83, 0.07832332 ]
                    ]
                }
            },
            expected: [
                { asks:
                    [
                        { amount: 0.01, price: 103.426 },
                        { amount: 15, price: 103.5 },
                        { amount: 0.425, price: 103.504 },
                        { amount: 0.1, price: 103.505 }
                    ],
                base: 'ETH',
                bids:
                    [
                        { amount: 2.48502251, price: 103.2 },
                        { amount: 0.46540304, price: 103.082 },
                        { amount: 0.99007913, price: 102.91 },
                        { amount: 0.07832332, price: 102.83 }
                    ],
                quote: 'BTC' }
            ]
        },
        case4: {
            source: {
                success: 0,
                error: 'Invalid pair name: btc_eth'
            },
            expected: 'Invalid pair name: btc_eth'
        }
    },
    getTradesTest: {
        case1: {
            source: {
                eth_btc: [
                    {
                        type: 'ask',
                        price: 103.6,
                        amount: 0.101,
                        tid: 4861261,
                        timestamp: 1370818007
                    },
                    {
                        type: 'bid',
                        price: 103.989,
                        amount: 1.51414,
                        tid: 4861254,
                        timestamp: 1370817960
                    }
                ]
            },
            expected: [
                {
                    base: 'ETH',
                    quote: 'BTC',
                    trades: [
                        {
                            amount: 0.101,
                            operation: 'sell',
                            orderId: undefined,
                            price: 103.6,
                            timestamp: 1370818007,
                            tradeId: 4861261
                        },
                        {
                            amount: 1.51414,
                            operation: 'buy',
                            orderId: undefined,
                            price: 103.989,
                            timestamp: 1370817960,
                            tradeId: 4861254
                        }]
                }
            ]

        },
        case3: {
            sourceForMarkets: [
                {
                    base: 'ETH',
                    quote: 'BTC',
                    precision: 3,
                    fee: 0.2,
                    minPrice: 0.1,
                    minAmount: 0.01,
                    maxPrice: 400,
                    maxAmount: 1000000,
                    minTotal: 0.0001
                }
            ],
            sourceForTrades: {
                eth_btc: [
                    {
                        type: 'ask',
                        price: 103.6,
                        amount: 0.101,
                        tid: 4861261,
                        timestamp: 1370818007
                    },
                    {
                        type: 'bid',
                        price: 103.989,
                        amount: 1.51414,
                        tid: 4861254,
                        timestamp: 1370817960
                    }
                ]
            },
            expected: [
                {
                    base: 'ETH',
                    quote: 'BTC',
                    trades: [
                        {
                            amount: 0.101,
                            operation: 'sell',
                            orderId: undefined,
                            price: 103.6,
                            timestamp: 1370818007,
                            tradeId: 4861261
                        },
                        {
                            amount: 1.51414,
                            operation: 'buy',
                            orderId: undefined,
                            price: 103.989,
                            timestamp: 1370817960,
                            tradeId: 4861254
                        }]
                }
            ]
        },
        case4: {
            source: {
                success: 0,
                error: 'Invalid pair name: btc_eth'
            },
            expected: 'Invalid pair name: btc_eth'
        }
    }
};