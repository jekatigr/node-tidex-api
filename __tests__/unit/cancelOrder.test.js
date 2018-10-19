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
    await expect(method()).rejects.toThrowError('Missing apiKey property for private api request');
}

async function emptyApiSecret(method) {
    await expect(method()).rejects.toThrowError('Missing apiSecret property for private api request');
}

describe('cancelOrder', () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { cancelOrderTest } = data;

    it('should throw error about empty apiKey', async () => {
        api.apiKey = '';
        await emptyApiKey(api.cancelOrder.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about undefined apiKey', async () => {
        api.apiKey = undefined;
        await emptyApiKey(api.cancelOrder.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about empty apiSecret', async () => {
        api.apiSecret = '';
        await emptyApiSecret(api.cancelOrder.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should throw error about undefined apiSecret', async () => {
        api.apiSecret = undefined;
        await emptyApiSecret(api.cancelOrder.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should return correct array of balance objects', async () => {
        const {
            case1: {
                source,
                expected
            }
        } = cancelOrderTest;

        mockRequest(true, JSON.stringify(source));

        const method = await api.cancelOrder(244073809);
        const signature = request.mock.calls[0][0].headers.Sign;
        const incorrectSign = !(signature) || signature === '';
        const urlRequest = request.mock.calls[0][0].url;

        expect(method).toEqual(expected);
        expect(request).toHaveBeenCalled();
        expect(urlRequest).toBe(' https://api.tidex.com/tapi');
        expect(incorrectSign).toBe(false);
    });

    it('should throw error about id is required', async () => {
        const method = api.cancelOrder();

        await expect(method).rejects.toThrowError('Order id is required for cancelOrder method.');
    });

    it('should throw error from exchange (success: 0, error: \'some error\'', async () => {
        const {
            case2: {
                source,
                expected
            }
        } = cancelOrderTest;

        mockRequest(true, JSON.stringify(source));

        const method = api.cancelOrder(1234);

        await expect(method).rejects.toThrowError(expected);
    });

    it('should reject with connection error from request', async () => {
        const {
            case3: {
                source,
                expected
            }
        } = cancelOrderTest;

        mockRequest(false, source);

        await expect(api.cancelOrder(123)).rejects.toThrowError(expected);
    });
});