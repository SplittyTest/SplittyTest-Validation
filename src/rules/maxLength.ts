export default function (max_length: number, message?: string) {
	return function (value: any) {
		if (typeof value !== 'undefined' && value.trim().length <= max_length) {
			return null;
		}
		return message || `Value must not exceed ${max_length} characters`;
	};
}
