<template>
	<div ref="root" :class="{ invalid: error }">
		<slot :invalid="!!error" :error_message="error"></slot>
	</div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, type PropType } from 'vue';
import { type FormValidator } from './FormValidator';
import { isUndefined, remove } from 'lodash-es';
import type { ValidationRule } from './FieldValidator';

export default defineComponent({
	name: 'FieldValidation',
	props: {
		el: {
			type: String,
			default: 'input, select, textarea',
		},
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
		replaceRules: {
			type: Boolean,
		},
		rules: {
			type: Array as PropType<ValidationRule[]>,
			default() {
				return [];
			},
		},
		validator: {
			type: Object as PropType<FormValidator>,
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
			async handler(new_value) {
				this.field?.setValue(new_value);
			},
			immediate: true,
		},
	},
	mounted() {
		// Add the field to the validator
		let group;
		if (Object.keys(this.modelModifiers).length === 1) {
			group = Object.keys(this.modelModifiers)[0];
		}

		if (!isUndefined(this.modelValue)) {
			this.validator.addField(this.name, ref(this.modelValue), this.rules || [], {
				replace_rules: this.replaceRules || false,
				group,
			});
		}

		nextTick(() => {
			// Add control elements to the validation methods
			const root = this.$refs.root as HTMLElement;
			const form_fields = root.querySelectorAll<HTMLElement>(this.el);
			this.form_fields = Array.from(form_fields);
			this.form_fields.forEach((form_field) => {
				if (form_field.getAttribute('has-validation') !== 'true') {
					this.validator.fields[this.name]?.controls.push(form_field);
					form_field.addEventListener('blur', (event: FocusEvent) => {
						if (!root.contains(event.relatedTarget as Node)) {
							this.validator.setTouched();
							if (this.validator.fields[this.name]!.group) {
								const group_name = this.validator.fields[this.name]!.group;
								this.validator.groups[group_name as string]!.setTouched();
							}
							this.validator.fields[this.name]!.setTouched();
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
