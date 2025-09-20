import { reactive, ref, type Ref } from 'vue';
import { forIn } from 'lodash-es';
import { FieldValidator, type FieldValidatorConfig } from './FieldValidatorClass';
import { asyncForEach } from 'modern-async';

export interface ValidatorConfig {
	fields?: Record<string, FieldValidatorConfig>;
}

export interface ValidationGroup {
	dirty: boolean;
	fields: Record<string, FieldValidator>;
	touched: boolean;
	validated: boolean;
}

export class Validator {
	dirty: boolean;
	errors: string[];
	fields: Record<string, FieldValidator>;
	groups: Record<string, ValidationGroup>;
	touched: boolean;
	validated: boolean;

	constructor(config: ValidatorConfig = {}) {
		this.dirty = false;
		this.errors = [];
		this.fields = {};
		this.groups = {};
		this.touched = false;
		this.validated = false;

		if (config.fields) {
			forIn(config.fields, (field_config, field_name) => {
				this.addField(field_name, field_config);
			});
		}
	}

	isValid(group_name?: string) {
		let field_names = Object.keys(this.fields);
		if (group_name) {
			field_names = Object.keys(this.groups[group_name]!.fields);
		}

		return field_names.every((field) => {
			return this.fields[field]!.errors.length === 0;
		});
	}

	reset(group_name?: string) {
		this.validated = false;
		this.errors = [];

		if (group_name) {
			forIn(this.groups[group_name]!.fields, (field) => {
				field.reset();
			});
		} else {
			forIn(this.fields, (field) => {
				field.reset();
			});
		}
	}

	addField(field_name: string, field_config: FieldValidatorConfig) {
		const new_field = new FieldValidator(field_config, this);
		this.fields[field_name] = new_field;

		if (field_config.group) {
			if (!this.groups[field_config.group]) {
				this.groups[field_config.group] = {
					dirty: false,
					fields: reactive({}),
					touched: false,
					validated: false,
				};
			}
			this.groups[field_config.group]!.fields[field_name] = new_field;
		}
	}

	removeField(field_name: string) {
		if (this.fields[field_name]!.group) {
			delete this.groups[this.fields[field_name]!.group]!.fields[field_name];
		}
		delete this.fields[field_name];
	}

	async validate(group_name?: string) {
		if (group_name && this.groups[group_name]) {
			const group = this.groups[group_name];

			await asyncForEach(Object.keys(group.fields), async (field) => {
				await group.fields[field]!.validate();
			});

			this.groups[group_name].validated = true;
		} else {
			await asyncForEach(Object.keys(this.fields), async (field) => {
				await this.fields[field]!.validate();
			});
			this.validated = true;
		}
	}
}
