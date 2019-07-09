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

describe('getOrder', () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { getOrderTest } = data;

    it('should throw error about empty apiKey', async () => {
        api.apiKey = '';
        await emptyApiKey(api.getOrder.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about undefined apiKey', async () => {
        api.apiKey = undefined;
        await emptyApiKey(api.getOrder.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about empty apiSecret', async () => {
        api.apiSecret = '';
        await emptyApiSecret(api.getOrder.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should throw error about undefined apiSecret', async () => {
        api.apiSecret = undefined;
        await emptyApiSecret(api.getOrder.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should return correct order with status closed', async () => {
        const {
            case1: {
                source,
                expected
            }
        } = getOrderTest;

        mockRequest(true, JSON.stringify(source));

        const order = await api.getOrder(234224913);
        const signature = request.mock.calls[0][0].headers.Sign;
        const incorrectSign = !(signature) || signature === '';
        const urlRequest = request.mock.calls[0][0].url;

        expect(order).toEqual(expected);
        expect(request).toHaveBeenCalled();
        expect(urlRequest).toBe(' https://api.tidex.com/tapi');
        expect(incorrectSign).toBe(false);
    });

    it('should throw error about id is required', async () => {
        const method = api.getOrder();

        await expect(method).rejects.toThrow('Order id is required for getOrder method.');
    });

    it('should throw error from exchange (success: 0, error: \'some error\'', async () => {
        const {
            case2: {
                source,
                expected
            }
        } = getOrderTest;

        mockRequest(true, JSON.stringify(source));

        const method = api.getOrder(1234);

        await expect(method).rejects.toThrow(expected);
    });

    it('should reject with connection error from request', async () => {
        const {
            case3: {
                source,
                expected
            }
        } = getOrderTest;

        mockRequest(false, source);

        await expect(api.getOrder(123)).rejects.toThrow(expected);
    });

    it('should return correct order with status active', async () => {
        const {
            case4: {
                source,
                expected
            }
        } = getOrderTest;

        mockRequest(true, JSON.stringify(source));

        const order = await api.getOrder(234224913);
        expect(order).toEqual(expected);
    });


    it('should return correct order with status cancelled', async () => {
        const {
            case5: {
                source,
                expected
            }
        } = getOrderTest;

        mockRequest(true, JSON.stringify(source));

        const order = await api.getOrder(234224913);
        expect(order).toEqual(expected);
    });

    it('should return correct order with status cancelled_partially', async () => {
        const {
            case6: {
                source,
                expected
            }
        } = getOrderTest;

        mockRequest(true, JSON.stringify(source));

        const order = await api.getOrder(234224913);
        expect(order).toEqual(expected);
    });

    it('should return correct order without status', async () => {
        const {
            case7: {
                source,
                expected
            }
        } = getOrderTest;

        mockRequest(true, JSON.stringify(source));

        const order = await api.getOrder(234224913);
        expect(order).toEqual(expected);
    });
});