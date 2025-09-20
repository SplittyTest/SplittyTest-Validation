<template>
	<div ref="root" :class="{ invalid: error }">
		<slot :invalid="!!error" :error_message="error"></slot>
	</div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from 'vue';
import { Validator } from './ValidatorClass';
import { isEqual, isPlainObject, remove } from 'lodash-es';
import type { ValidationRule } from './FieldValidatorClass';

export default defineComponent({
	name: 'FieldValidation',
	props: {
		name: {
			type: String,
			required: true,
		},
		hideError: Boolean,
		modelValue: {
			type: null,
		},
		modelModifiers: {
			default: () => ({}),
		},
		rules: {
			type: Array as PropType<ValidationRule[]>,
			default() {
				return [];
			},
		},
		validator: {
			type: Validator,
			required: true,
		},
	},
	data() {
		return {
			form_fields: [] as HTMLElement[],
		};
	},
	computed: {
		field() {
			return this.validator.fields[this.name]!;
		},
		error() {
			if (this.field && this.field.errors.length) {
				return this.field.errors[0];
			}
			return null;
		},
	},
	watch: {
		modelValue: {
			async handler(new_value: any, old_value: any) {
				if (!isEqual(new_value, old_value)) {
					if (this.field) {
						this.field.value = new_value;
						this.field.dirty = true;
					}
					this.validator.dirty = true;
					if (this.field.group) {
						this.validator.groups[this.field.group]!.dirty = true;
					}
					if (this.field.touched) {
						await this.field.validate();
					}
				}
			},
			deep: true,
		},
	},
	mounted() {
		// Add the field to the validator
		if (!this.field) {
			let group;
			if (Object.keys(this.modelModifiers).length === 1) {
				group = Object.keys(this.modelModifiers)[0];
			}
			this.validator.addField(this.name, {
				value: this.modelValue,
				rules: this.rules,
				group,
			});
		}

		nextTick(() => {
			// Add control elements to the validation methods
			const root = this.$refs.root as HTMLElement;
			const form_fields = root.querySelectorAll<HTMLElement>('input, select, textarea');
			this.form_fields = Array.from(form_fields);
			this.form_fields.forEach((form_field) => {
				if (form_field.getAttribute('has-validation') !== 'true') {
					this.validator.fields[this.name]?.controls.push(form_field);
					form_field.addEventListener('blur', (event: FocusEvent) => {
						if (!root.contains(event.relatedTarget as Node)) {
							this.validator.touched = true;
							if (this.validator.fields[this.name]!.group) {
								const group_name = this.validator.fields[this.name]!.group;
								this.validator.groups[group_name as string]!.touched = true;
							}
							this.validator.fields[this.name]!.touched = true;
							this.validator.fields[this.name]!.validate();
						}
					});
					form_field.setAttribute('has-validation', 'true');
				}
			});
		});
	},
	beforeUnmount() {
		this.form_fields.forEach((form_field) => {
			remove(this.validator.fields[this.name]!.controls, form_field);
		});
	},
});
</script>
