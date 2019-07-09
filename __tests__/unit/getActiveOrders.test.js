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

describe('getActiveOrders', () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { getActiveOrdersTest } = data;
    it('should throw error about empty apiKey', async () => {
        api.apiKey = '';
        await emptyApiKey(api.getActiveOrders.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about undefined apiKey', async () => {
        api.apiKey = undefined;
        await emptyApiKey(api.getActiveOrders.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about empty apiSecret', async () => {
        api.apiSecret = '';
        await emptyApiSecret(api.getActiveOrders.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should throw error about undefined apiSecret', async () => {
        api.apiSecret = undefined;
        await emptyApiSecret(api.getActiveOrders.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should return correct array of active orders objects', async () => {
        const {
            case1: {
                source,
                expected
            }
        } = getActiveOrdersTest;

        mockRequest(true, JSON.stringify(source));

        const activeOrders = await api.getActiveOrders();
        delete activeOrders[0].created;
        const signature = request.mock.calls[0][0].headers.Sign;
        const incorrectSign = !(signature) || signature === '';
        const urlRequest = request.mock.calls[0][0].url;

        expect(activeOrders).toEqual(expected);
        expect(request).toHaveBeenCalled();
        expect(urlRequest).toBe(' https://api.tidex.com/tapi');
        expect(incorrectSign).toBe(false);
    });


    it('should return correct array of active orders objects with symbols', async () => {
        const {
            case1: {
                source,
                expected
            }
        } = getActiveOrdersTest;

        mockRequest(true, JSON.stringify(source));
        const activeOrders = await api.getActiveOrders('REM/ETH');
        delete activeOrders[0].created;

        expect(activeOrders).toEqual(expected);
    });

    it('should throw error from exchange (success: 0, error: \'some error.\')', async () => {
        const {
            case2: {
                source,
                expected
            }
        } = getActiveOrdersTest;

        mockRequest(true, JSON.stringify(source));

        const method = api.getActiveOrders();

        await expect(method).rejects.toThrow(expected);
    });

    it('should return empty array', async () => {
        const {
            case3: {
                source
            }
        } = getActiveOrdersTest;

        mockRequest(true, JSON.stringify(source));

        const activeOrders = await api.getActiveOrders();

        expect(activeOrders).toEqual([]);
    });

    it('should reject with connection error from request', async () => {
        const {
            case4: {
                source,
                expected
            }
        } = getActiveOrdersTest;

        mockRequest(false, source);

        await expect(api.getActiveOrders()).rejects.toThrow(expected);
    });
});