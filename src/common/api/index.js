import Http from 'common/util/http';

export function test(params) {
    return Http.post('/test', { ...params });
}
