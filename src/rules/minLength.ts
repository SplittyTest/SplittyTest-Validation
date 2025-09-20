export default function (min_length: number, message: string) {
	return function (value: any) {
		if (typeof value !== 'undefined' && value.trim().length >= min_length) {
			return null;
		}
		return message || `Value must be at least ${min_length} characters`;
	};
}
