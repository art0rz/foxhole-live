function timedMemoization<T>(memoize: () => Promise<T>, timeout: number) {
	let data: T | null = null;

	async function invalidate() {
		data = null;
	}

	setTimeout(invalidate, timeout);

	return {
		async getData(): Promise<T> {
			if (data === null) {
				data = await memoize();
			}

			return data;
		},
	};
}

export default timedMemoization;
