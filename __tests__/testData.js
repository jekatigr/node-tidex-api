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
                {
                    asks:
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
                    quote: 'BTC'
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
                {
                    asks:
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
                    quote: 'BTC'
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
    },
    getAccountInfoTest: {
        case1: {
            source: {
                success: 1,
                return: {
                    funds: {
                        btc: 0,
                        ltc: 0,
                        eth: 0.03663645195115,
                        dash: 0,
                        doge: 0,
                        bts: 0,
                        steem: 0,
                        waves: 0,
                        wct: 0,
                        wbtc: 0,
                        incnt: 0,
                        'b@': 0,
                        mrt: 0,
                        mer: 0,
                        aqua: 0,
                        rbx: 0,
                        tks: 0,
                        wusd: 0,
                        weur: 0,
                        wgo: 0,
                        gnt: 0,
                        edg: 0,
                        rlc: 0,
                        icn: 0,
                        wings: 0,
                        vsl: 0,
                        time: 0,
                        taas: 0,
                        kolion: 0,
                        riddle: 0,
                        ant: 0,
                        efyt: 0,
                        mgo: 0,
                        wett: 0,
                        eett: 0,
                        qrl: 0,
                        emgo: 0,
                        bnt: 0,
                        snm: 0,
                        zrc: 0,
                        snt: 0,
                        mco: 0,
                        storj: 0,
                        eos: 0,
                        wgr: 0,
                        sta: 0,
                        pbt: 0,
                        bch: 0,
                        wsur: 0,
                        sur: 0,
                        msp: 0,
                        inpay: 0,
                        mtl: 0,
                        aht: 0,
                        ping: 0,
                        eot: 0,
                        ae: 0,
                        pix: 0,
                        credo: 0,
                        life: 0,
                        mth: 0,
                        bmc: 0,
                        trct: 0,
                        knc: 0,
                        msd: 0,
                        sub: 0,
                        enj: 0,
                        evx: 0,
                        ocl: 0,
                        eng: 0,
                        tdx: 0,
                        la: 0,
                        prg: 0,
                        icos: 0,
                        usdt: 0,
                        arn: 0,
                        ryz: 0,
                        b2b: 0,
                        cat: 0,
                        snov: 0,
                        drgn: 0,
                        tie: 0,
                        trx: 0,
                        wax: 0,
                        agi: 0,
                        vee: 0,
                        omg: 0,
                        srn: 0,
                        tio: 0,
                        sol: 0,
                        zrx: 0,
                        bar: 0,
                        key: 0,
                        idh: 0,
                        bdg: 0,
                        cpc: 0,
                        stq: 0,
                        mtn: 0,
                        bins: 0,
                        plc: 0,
                        dth: 0,
                        ntk: 0,
                        ren: 0,
                        cs: 0,
                        rem: 0,
                        dmt: 0,
                        hkn: 0,
                        tbar: 0,
                        drop: 0,
                        hav: 0,
                        loom: 0,
                        echt: 0,
                        ven: 0,
                        crpt: 0,
                        sen: 0,
                        hur: 0,
                        svd: 0,
                        fsn: 0,
                        poa: 0,
                        npxs: 0,
                        plcn: 0,
                        engt: 0,
                        smq: 0
                    },
                    rights: {
                        info: true,
                        trade: true,
                        withdraw: false
                    },
                    transaction_count: 0,
                    open_orders: 1,
                    server_time: 1539359278
                },
                stat: {
                    isSuccess: true,
                    serverTime: '00:00:00.0001549',
                    time: '00:00:00.0110166',
                    errors: null
                }
            },
            expected: {
                balances:
                    [
                        {
                            currency: 'ETH',
                            free: 0,
                            used: 0,
                            total: 0.03663645195115
                        }
                    ],
                openOrdersCount: 1,
                rights: {
                    info: true,
                    trade: true,
                    withdraw: false
                }
            },
        },
        case2: {
            source: 'empty method',
            expected: 'Exception for private method \'getInfo\' request, params: {}, ex: empty method'
        },
        case3: {
            source: {
                success: 0,
                error: 'some error'
            },
            expected: 'Error from exchange, error: \'some error\''
        }
    },
    getAccountInfoExtendedTest: {
        case1: {
            source: {
                success: 1,
                return: {
                    funds: {
                        eth: {
                            value: 0.0400675793891501,
                            inOrders: 0
                        }
                    },
                    rights: {
                        info: true,
                        trade: true,
                        withdraw: false
                    },
                    transaction_count: 0,
                    open_orders: 0,
                    server_time: 1539599447
                },
                stat: {
                    isSuccess: true,
                    serverTime: '00:00:00.0000599',
                    time: '00:00:00.0106174',
                    errors: null
                }
            },
            expected: {
                balances: [
                    {
                        currency: 'ETH',
                        free: 0.0400675793891501,
                        used: 0,
                        total: 0.0400675793891501
                    }
                ],
                openOrdersCount: 0,
                rights: {
                    info: true,
                    trade: true,
                    withdraw: false
                }
            }
        },
        case2: {
            source: 'empty method',
            expected: 'Exception for private method \'getInfoExt\' request, params: {}, ex: empty method'
        },
        case3: {
            source: {
                success: 0,
                error: 'some error'
            },
            expected: 'Error from exchange, error: \'some error\''
        }
    }
};