import { asyncForEach } from 'modern-async';
import { type Validator } from './ValidatorClass';

export interface FieldValidatorConfig {
	value: any;
	rules: ValidationRule[];
	group?: string;
}

export type ValidationRule = (value: any, ...args: any) => Promise<string | null> | (string | null);

export class FieldValidator {
	controls: HTMLElement[];
	dirty: boolean;
	errors: string[];
	group?: string;
	rules: ValidationRule[];
	touched: boolean;
	validated: boolean;
	validator: Validator;
	value: any;

	constructor(config: FieldValidatorConfig, validator: Validator) {
		this.controls = [];
		this.dirty = false;
		this.errors = [];
		this.rules = config.rules;
		this.touched = false;
		this.validated = false;
		this.validator = validator;
		this.value = config.value;

		if (config.group) {
			this.group = config.group;
		}
	}

	get isValid() {
		return this.errors.length === 0;
	}

	reset() {
		this.touched = false;
		this.dirty = false;
		this.validated = false;
		this.errors = [];
	}

	async validate() {
		this.errors = [];

		// Only validate if the controls are not disabled or hidden
		let should_validate = false;
		if (
			this.controls.length > 0 &&
			this.controls?.every((control_element) => {
				return !control_element.getAttribute('disabled');
			})
		) {
			should_validate = true;
		}

		if (should_validate) {
			await asyncForEach(this.rules, async (rule: ValidationRule) => {
				const error = await rule(this.value);
				if (error !== null) {
					this.errors.push(error);
				}
			});
		}

		return this.isValid;
	}
}
