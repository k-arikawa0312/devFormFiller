import { faker } from "@faker-js/faker";
import { type FieldType } from "./types";

type FakerMethod = () => string | number | boolean | Date | object;
type FakerValue = string | number | boolean | Date | object | FakerMethod;

/**
 * Faker.js-based random value generator
 * Provides type-safe methods for generating random form data
 */
export class FakerGenerator {

  /**
   * Generate a random value based on the faker method path
   * @param methodPath - Dot notation path to faker method (e.g., "person.fullName")
   * @returns Generated random value
   */
  generateByMethod(methodPath: string): string | number {
    try {
      const keys = methodPath.split(".");
      let currentValue: object = faker;

      for (const key of keys) {
        if (this.isObjectWithKey(currentValue, key)) {
          currentValue = currentValue[key] as object;
        } else {
          throw new Error(`Invalid faker method path: ${methodPath}`);
        }
      }

      if (this.isCallable(currentValue)) {
        const result = currentValue();
        return this.coerceToStringOrNumber(result);
      }

      return this.coerceToStringOrNumber(currentValue);
    } catch (error) {
      console.error(`Error generating value for ${methodPath}:`, error);
      return "";
    }
  }

  /**
   * Type guard to check if value is an object with the given key
   */
  private isObjectWithKey(value: object, key: string): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && key in value;
  }

  /**
   * Type guard to check if value is callable
   */
  private isCallable(value: unknown): value is FakerMethod {
    return typeof value === "function";
  }

  /**
   * Coerce value to string or number
   */
  private coerceToStringOrNumber(value: FakerValue): string | number {
    if (typeof value === "string" || typeof value === "number") {
      return value;
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (value instanceof Date) {
      return value.toISOString().split("T")[0];
    }
    return String(value);
  }

  /**
   * Generate a random value based on field type
   * @param fieldType - The type of form field
   * @param fakerMethod - Optional specific faker method to use
   * @returns Generated random value appropriate for the field type
   */
  generateByFieldType(
    fieldType: FieldType,
    fakerMethod?: string,
  ): string | number {
    if (fakerMethod) {
      const value = this.generateByMethod(fakerMethod);
      // Ensure type compatibility
      if (fieldType === "number" && typeof value === "string") {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
      }
      return value;
    }

    // Default behavior based on field type
    switch (fieldType) {
      case "text":
        return this.generateText();

      case "email":
        return this.generateEmail();

      case "number":
        return this.generateNumber();

      case "date":
        return this.generateDate();

      case "select":
      case "checkbox":
        return this.generateBoolean();

      default:
        return this.generateText();
    }
  }

  /**
   * Generate random text (person's name)
   */
  generateText(): string {
    return faker.person.fullName();
  }

  /**
   * Generate random email address
   */
  generateEmail(): string {
    return faker.internet.email();
  }

  /**
   * Generate random number
   */
  generateNumber(): number {
    return faker.number.int({ min: 1, max: 1000 });
  }

  /**
   * Generate random date
   */
  generateDate(): string {
    return faker.date.recent().toISOString().split("T")[0];
  }

  /**
   * Generate random boolean (for checkbox/select)
   */
  generateBoolean(): string {
    return faker.helpers.arrayElement([true, false]) ? "true" : "false";
  }

  /**
   * Generate random phone number
   */
  generatePhone(): string {
    return faker.phone.number();
  }

  /**
   * Generate random company name
   */
  generateCompany(): string {
    return faker.company.name();
  }

  /**
   * Generate random address
   */
  generateAddress(): string {
    return faker.location.streetAddress();
  }

  /**
   * Generate random ZIP/postal code
   */
  generateZipCode(): string {
    return faker.location.zipCode();
  }

  /**
   * Generate random username
   */
  generateUsername(): string {
    return faker.internet.username();
  }

  /**
   * Generate random password
   */
  generatePassword(): string {
    return faker.internet.password();
  }

  /**
   * Generate random URL
   */
  generateUrl(): string {
    return faker.internet.url();
  }

  /**
   * Generate random UUID
   */
  generateUuid(): string {
    return faker.string.uuid();
  }

  /**
   * Generate multiple random values
   * @param fieldType - The type of form field
   * @param count - Number of values to generate
   * @param fakerMethod - Optional specific faker method to use
   * @returns Array of generated random values
   */
  generateMultiple(
    fieldType: FieldType,
    count: number,
    fakerMethod?: string,
  ): (string | number)[] {
    const values: (string | number)[] = [];
    for (let i = 0; i < count; i++) {
      values.push(this.generateByFieldType(fieldType, fakerMethod));
    }
    return values;
  }

  /**
   * Generate random data from an object schema
   * @param schema - Object mapping field names to faker methods or field types
   * @returns Object with generated random values
   */
  generateFromSchema<
    T extends Record<string, string | { type: FieldType; method?: string }>,
  >(schema: T): Record<string, string | number> {
    const result: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === "string") {
        result[key] = this.generateByMethod(value);
      } else if (typeof value === "object" && "type" in value) {
        result[key] = this.generateByFieldType(value.type, value.method);
      }
    }

    return result;
  }
}
