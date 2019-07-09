jest.mock('request-promise-native');

const request = require('request-promise-native');
const TidexApi = require('../../index');

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
    await expect(method()).rejects.toThrow('Missing apiKey property for private api request');
}

async function emptyApiSecret(method) {
    await expect(method()).rejects.toThrow('Missing apiSecret property for private api request');
}

describe('getTradeHistory', () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { getTradeHistoryTest } = data;

    it('should throw error about empty apiKey', async () => {
        api.apiKey = '';
        await emptyApiKey(api.getTradeHistory.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about undefined apiKey', async () => {
        api.apiKey = undefined;
        await emptyApiKey(api.getTradeHistory.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about empty apiSecret', async () => {
        api.apiSecret = '';
        await emptyApiSecret(api.getTradeHistory.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should throw error about undefined apiSecret', async () => {
        api.apiSecret = undefined;
        await emptyApiSecret(api.getTradeHistory.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should return correct array of trade history', async () => {
        const {
            case1: {
                source,
                expected
            }
        } = getTradeHistoryTest;

        mockRequest(true, JSON.stringify(source));

        const tradeHistory = await api.getTradeHistory();
        const signature = request.mock.calls[0][0].headers.Sign;
        const incorrectSign = !(signature) || signature === '';
        const urlRequest = request.mock.calls[0][0].url;

        expect(tradeHistory).toEqual(expected);
        expect(request).toHaveBeenCalled();
        expect(urlRequest).toBe(' https://api.tidex.com/tapi');
        expect(incorrectSign).toBe(false);
    });

    it('should return two correct object of trade history', async () => {
        const {
            case2: {
                source,
                expected
            }
        } = getTradeHistoryTest;

        mockRequest(true, JSON.stringify(source));

        const tradeHistory = await api.getTradeHistory({ fromId: 25070252, count: 2, symbol: 'REM/ETH' });
        expect(tradeHistory).toEqual(expected);
    });

    it('should return empty array', async () => {
        const {
            case3: {
                source
            }
        } = getTradeHistoryTest;

        mockRequest(true, JSON.stringify(source));

        const tradeHistory = await api.getTradeHistory();
        expect(tradeHistory).toEqual([]);
    });

    it('should throw error from exchange (success: 0, error: \'some error.\')', async () => {
        const {
            case4: {
                source,
                expected
            }
        } = getTradeHistoryTest;

        mockRequest(true, JSON.stringify(source));

        const method = api.getTradeHistory();

        await expect(method).rejects.toThrow(expected);
    });

    it('should reject with connection error from request', async () => {
        const {
            case5: {
                source,
                expected
            }
        } = getTradeHistoryTest;

        mockRequest(false, source);

        await expect(api.getTradeHistory()).rejects.toThrow(expected);
    });
});