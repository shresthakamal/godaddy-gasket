const spaceErrorResponse = new Error(
  JSON.stringify({
    status: 404,
    statusText: 'Not Found',
    message: 'The resource could not be found.',
    details: {
      type: 'Space',
      id: 'e0jfbtpr1w59'
    },
    request: {
      url: 'https://preview.contentful.com:443/spaces/e0jfbtpr1w59/environments/master2/entries',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/vnd.contentful.delivery.v1+json',
        'X-Contentful-Resource-Resolution': '<SENSITIVE-ACCESS-TOKEN>',
        'X-Contentful-User-Agent':
          'sdk contentful.js/11.5.4; platform node.js/v22.13.1; os macOS/v22.13.1;',
        'Authorization': 'Bearer ...i_KuA',
        'User-Agent': 'axios/1.8.1',
        'Accept-Encoding': 'gzip, compress, deflate, br'
      },
      method: 'get'
    },
    requestId: '424aecee-c8fe-4f07-a8f9-c14abf7b4c89'
  })
);
spaceErrorResponse.name = 'NotFound';
export { spaceErrorResponse };

const envErrorResponse = new Error(
  JSON.stringify({
    status: 404,
    statusText: 'Not Found',
    message: 'The resource could not be found.',
    details: {
      type: 'Environment',
      id: 'master2',
      space: 'e0jfbtpr1w58'
    },
    request: {
      url: 'https://preview.contentful.com:443/spaces/e0jfbtpr1w58/environments/master2/entries',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/vnd.contentful.delivery.v1+json',
        'X-Contentful-Resource-Resolution': '<SENSITIVE-ACCESS-TOKEN>',
        'X-Contentful-User-Agent':
          'sdk contentful.js/11.5.4; platform node.js/v22.13.1; os macOS/v22.13.1;',
        'Authorization': 'Bearer ...i_KuA',
        'User-Agent': 'axios/1.8.1',
        'Accept-Encoding': 'gzip, compress, deflate, br'
      },
      method: 'get'
    },
    requestId: '424aecee-c8fe-4f07-a8f9-c14abf7b4c89'
  })
);
envErrorResponse.name = 'NotFound';
export { envErrorResponse };

const invalidQueryErrorResponse = new Error(
  JSON.stringify({
    status: 400,
    statusText: 'Bad Request',
    message:
      'The value provided for "limit" is invalid. Please provide a value between 0 and 1000',
    details: {
      errors: []
    },
    request: {
      url: 'https://preview.contentful.com:443/spaces/e0jfbtpr1w58/environments/master/entries',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/vnd.contentful.delivery.v1+json',
        'X-Contentful-Resource-Resolution': '<SENSITIVE-ACCESS-TOKEN>',
        'X-Contentful-User-Agent':
          'sdk contentful.js/11.5.4; platform node.js/v22.13.1; os macOS/v22.13.1;',
        'Authorization': 'Bearer ...i_KuA',
        'User-Agent': 'axios/1.8.1',
        'Accept-Encoding': 'gzip, compress, deflate, br'
      },
      method: 'get'
    },
    requestId: 'f4055e68-d8b7-4f26-92a5-39d597139390'
  })
);
invalidQueryErrorResponse.name = 'InvalidQuery';
export { invalidQueryErrorResponse };
