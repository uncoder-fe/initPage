import Http from 'assets/util/http';

export function test(params) {
	return Http.get('/test', { ...params });
}
