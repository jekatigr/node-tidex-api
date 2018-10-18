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

describe('getAccountInfo', () => {
    afterEach(() => {
        request.mockRestore();
    });

    const { getAccountInfoTest } = data;
    it('should throw error about empty apiKey', async () => {
        api.apiKey = '';
        await emptyApiKey(api.limitOrder.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about undefined apiKey', async () => {
        api.apiKey = undefined;
        await emptyApiKey(api.limitOrder.bind(api));

        api.apiKey = 'klndscfds';
    });

    it('should throw error about empty apiSecret', async () => {
        api.apiSecret = '';
        await emptyApiSecret(api.limitOrder.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should throw error about undefined apiSecret', async () => {
        api.apiSecret = undefined;
        await emptyApiSecret(api.limitOrder.bind(api));

        api.apiSecret = 'skdjncs';
    });

    it('should return correct AccountInfo object', async () => {
        const {
            case1: {
                source,
                expected
            }
        } = getAccountInfoTest;

        mockRequest(true, JSON.stringify(source));

        const accountInfo = await api.getAccountInfo();
        const signature = request.mock.calls[0][0].headers.Sign;
        const incorrectSign = !(signature) || signature === '';
        const urlRequest = request.mock.calls[0][0].url;

        expect(accountInfo).toEqual(expected);
        expect(request).toHaveBeenCalled();
        expect(urlRequest).toBe(' https://api.tidex.com/tapi');
        expect(incorrectSign).toBe(false);
    });

    it('should reject with connection error from request', async () => {
        const {
            case2: {
                source,
                expected
            }
        } = getAccountInfoTest;

        mockRequest(false, source);

        await expect(api.getAccountInfo()).rejects.toThrowError(expected);
    });

    it('should throw error from exchange (success: 0)', async () => {
        const {
            case3: {
                source,
                expected
            }
        } = getAccountInfoTest;

        mockRequest(true, JSON.stringify(source));

        await expect(api.getAccountInfo()).rejects.toThrowError(expected);
    });
});