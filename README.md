# validation

This is a validation library for Vue 3 that is both simple but powerful.

## Install

Install with NPM:

```
$ npm install @splitty-test/validation
```

## Usage

Using Composition API...

In the script:

```js
<script setup>
import { ref } from 'vue';
import { FieldValidation, useFormValidator, rules } from '@splitty-test/validation';

const login_form_validator = useFormValidator();
const email = ref('');
const password = ref('');

async function handleFormSubmit() {
    // Validate the form fields
    const is_valid = await login_form_validator.validate();

    if (is_valid) {
        // DO THE REST OF THE FORM SUBMIT STUFF
    }
}

export {
    email,
    password,
    rules,
    handleFormSubmit
}
</script>
```

In the template:

```html
<template>
    <div class='login-form'>
        <div class='email-field'>
            <FieldValidation name="email" v-model="email" :validator="login_form_validator" :rules="[rules.required, rules.email]">
                <input name="email" v-model="email">
            </FieldValidation>
        </div>
        <div class='password-field'>
            <FieldValidation name="password" v-model="password" :validator="login_form_validator" :rules="[rules.required]">
                <input name="password" v-model="password">
            </FieldValidation>
        </div>
        <div class='submit-button'>
            <input type="button" @click="handleFormSubmit()">Login</input>
        </div>
    </div>
</template>
```

### FieldValidation Component Properties

- **name (String) - Required:** A unique name for the field that is used intenally to reference the field being validated.
- **v-model (any) - Required:** The value that is being validated.
- **validator (FormValidator) - Required:** The instance of the FormValidator that the field is attached to.
