/**
 * Example usage and tests for faker generator
 *
 * This file demonstrates how to use the faker generator system
 */

import { fakerGenerator } from '../fakerGenerator';
import { generateFieldValue, generateFormFields, getFakerMethodForField } from '../fieldGenerators';
import type { FieldType } from '../types';

// Example 1: Basic usage - generate values by method path
console.log('=== Example 1: Generate by method path ===');
console.log('Full Name:', fakerGenerator.generateByMethod('person.fullName'));
console.log('Email:', fakerGenerator.generateByMethod('internet.email'));
console.log('Phone:', fakerGenerator.generateByMethod('phone.number'));
console.log('');

// Example 2: Generate by field type
console.log('=== Example 2: Generate by field type ===');
const fieldTypes: FieldType[] = ['text', 'email', 'number', 'date', 'select'];
fieldTypes.forEach(type => {
  console.log(`${type}:`, fakerGenerator.generateByFieldType(type));
});
console.log('');

// Example 3: Generate for specific field names
console.log('=== Example 3: Generate for field names ===');
const fieldNames = [
  'firstName',
  'lastName',
  'userEmail',
  'phoneNumber',
  'zipCode',
  'companyName',
  'website',
];
fieldNames.forEach(name => {
  console.log(`${name}:`, generateFieldValue(name, 'text'));
});
console.log('');

// Example 4: Generate multiple values
console.log('=== Example 4: Generate multiple values ===');
const emails = fakerGenerator.generateMultiple('email', 5);
console.log('5 random emails:', emails);
console.log('');

// Example 5: Generate from schema
console.log('=== Example 5: Generate from schema ===');
const userData = fakerGenerator.generateFromSchema({
  firstName: 'person.firstName',
  lastName: 'person.lastName',
  email: 'internet.email',
  age: { type: 'number', method: 'number.int' },
  address: 'location.streetAddress',
  city: 'location.city',
  zipCode: 'location.zipCode',
});
console.log('User data:', userData);
console.log('');

// Example 6: Generate form fields
console.log('=== Example 6: Generate form fields ===');
const formData = generateFormFields([
  { name: 'username', type: 'text' },
  { name: 'email', type: 'email' },
  { name: 'phone', type: 'text' },
  { name: 'age', type: 'number' },
  { name: 'newsletter', type: 'checkbox' },
  { name: 'birthdate', type: 'date' },
]);
console.log('Form data:', formData);
console.log('');

// Example 7: Get faker method for field name
console.log('=== Example 7: Get faker method for field name ===');
const testFields = [
  'firstName',
  'userEmail',
  'phoneNumber',
  'zipCode',
  'companyName',
  'creditCard',
  'someUnknownField',
];
testFields.forEach(field => {
  const method = getFakerMethodForField(field);
  console.log(`${field} -> ${method || 'No match'}`);
});
console.log('');

// Example 8: Helper methods
console.log('=== Example 8: Helper methods ===');
console.log('Company:', fakerGenerator.generateCompany());
console.log('Address:', fakerGenerator.generateAddress());
console.log('ZIP Code:', fakerGenerator.generateZipCode());
console.log('Username:', fakerGenerator.generateUsername());
console.log('Password:', fakerGenerator.generatePassword());
console.log('URL:', fakerGenerator.generateUrl());
console.log('UUID:', fakerGenerator.generateUuid());
console.log('');

// Example 9: Change locale
console.log('=== Example 9: Change locale ===');
console.log('Current locale:', fakerGenerator.getLocale());
console.log('Japanese name:', fakerGenerator.generateByMethod('person.fullName'));

fakerGenerator.setLocale('en');
console.log('English name:', fakerGenerator.generateByMethod('person.fullName'));

fakerGenerator.setLocale('ja');
console.log('Japanese name (restored):', fakerGenerator.generateByMethod('person.fullName'));
console.log('');

// Example 10: Complex schema generation
console.log('=== Example 10: Complex schema generation ===');
const orderData = fakerGenerator.generateFromSchema({
  customerName: 'person.fullName',
  customerEmail: 'internet.email',
  customerPhone: 'phone.number',
  shippingAddress: 'location.streetAddress',
  shippingCity: 'location.city',
  shippingZip: 'location.zipCode',
  productName: 'commerce.productName',
  productPrice: { type: 'number', method: 'commerce.price' },
  orderDate: 'date.recent',
  orderId: 'string.uuid',
});
console.log('Order data:', orderData);
