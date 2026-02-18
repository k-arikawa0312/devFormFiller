import { fakerGenerator } from "./fakerGenerator";
import { type FieldType } from "./types";

/**
 * Predefined faker methods for common field types
 * Maps semantic field names to appropriate faker methods
 */
export const FIELD_METHOD_MAPPING: Record<string, string> = {
  // Person fields
  firstName: "person.firstName",
  lastName: "person.lastName",
  fullName: "person.fullName",
  username: "internet.username",
  password: "internet.password",
  email: "internet.email",
  phone: "phone.number",
  mobile: "phone.number",

  // Location fields
  address: "location.streetAddress",
  city: "location.city",
  state: "location.state",
  zipCode: "location.zipCode",
  postalCode: "location.zipCode",
  country: "location.country",

  // Company fields
  company: "company.name",
  companyName: "company.name",
  jobTitle: "person.jobTitle",
  department: "company.department",

  // Date fields
  birthDate: "date.past",
  startDate: "date.recent",
  endDate: "date.future",

  // Internet fields
  website: "internet.url",
  url: "internet.url",
  domain: "internet.domainName",
  ip: "internet.ip",

  // ID fields
  uuid: "string.uuid",
  id: "string.nanoid",

  // Finance fields
  creditCard: "finance.creditCardNumber",
  iban: "finance.iban",
  bic: "finance.bic",

  // Product fields
  productName: "commerce.productName",
  price: "commerce.price",
  ean: "commerce.ean8",

  // Text content
  title: "lorem.sentence",
  description: "lorem.paragraph",
  comment: "lorem.paragraph",
  notes: "lorem.lines",
};

/**
 * Get appropriate faker method for a field name
 * @param fieldName - Name of the form field
 * @returns Faker method path or undefined
 */
export function getFakerMethodForField(fieldName: string): string | undefined {
  const normalizedName = fieldName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Direct match
  if (normalizedName in FIELD_METHOD_MAPPING) {
    return FIELD_METHOD_MAPPING[normalizedName];
  }

  // Partial match (e.g., "userEmail" -> "email")
  for (const [key, method] of Object.entries(FIELD_METHOD_MAPPING)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return method;
    }
  }

  return undefined;
}

/**
 * Generate a value for a form field based on its name and type
 * @param fieldName - Name/ID of the form field
 * @param fieldType - Type of the form field
 * @returns Generated random value
 */
export function generateFieldValue(
  fieldName: string,
  fieldType: FieldType,
): string | number {
  const fakerMethod = getFakerMethodForField(fieldName);
  return fakerGenerator.generateByFieldType(fieldType, fakerMethod);
}

/**
 * Generate values for multiple form fields
 * @param fields - Array of field definitions
 * @returns Object mapping field names to generated values
 */
export function generateFormFields(
  fields: Array<{ name: string; type: FieldType; fakerMethod?: string }>,
): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  for (const field of fields) {
    if (field.fakerMethod) {
      result[field.name] = fakerGenerator.generateByMethod(field.fakerMethod);
    } else {
      result[field.name] = generateFieldValue(field.name, field.type);
    }
  }

  return result;
}

/**
 * Available faker method categories for UI selection
 */
export const FAKER_CATEGORIES = {
  person: {
    name: "Person",
    methods: [
      "person.firstName",
      "person.lastName",
      "person.fullName",
      "person.jobTitle",
    ],
  },
  internet: {
    name: "Internet",
    methods: [
      "internet.email",
      "internet.username",
      "internet.password",
      "internet.url",
      "internet.domainName",
    ],
  },
  phone: {
    name: "Phone",
    methods: ["phone.number"],
  },
  location: {
    name: "Location",
    methods: [
      "location.streetAddress",
      "location.city",
      "location.state",
      "location.zipCode",
      "location.country",
    ],
  },
  company: {
    name: "Company",
    methods: ["company.name", "company.department"],
  },
  finance: {
    name: "Finance",
    methods: ["finance.creditCardNumber", "finance.iban"],
  },
  commerce: {
    name: "Commerce",
    methods: ["commerce.productName", "commerce.price"],
  },
  date: {
    name: "Date",
    methods: ["date.past", "date.recent", "date.future", "date.birthdate"],
  },
  lorem: {
    name: "Lorem Ipsum",
    methods: ["lorem.word", "lorem.sentence", "lorem.paragraph"],
  },
  string: {
    name: "String",
    methods: ["string.uuid", "string.nanoid"],
  },
  number: {
    name: "Number",
    methods: ["number.int", "number.float"],
  },
} as const;

export type FakerCategory = keyof typeof FAKER_CATEGORIES;
