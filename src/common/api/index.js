import Http from 'assets/util/http';

export function test(params) {
	return Http.post('/test', {...params});
}
