import { faker } from "@faker-js/faker";
import { type FieldType } from "./types";

/**
 * Faker.js-based random value generator
 * Provides type-safe methods for generating random form data
 */
export class FakerGenerator {
  private locale: string = "ja";

  /**
   * Generate a random value based on the faker method path
   * @param methodPath - Dot notation path to faker method (e.g., "person.fullName")
   * @returns Generated random value
   */
  generateByMethod(methodPath: string): string | number {
    try {
      const keys = methodPath.split(".");
      let value: any = faker;

      for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
          value = value[key];
        } else {
          throw new Error(`Invalid faker method path: ${methodPath}`);
        }
      }

      if (typeof value === "function") {
        return value();
      }

      return value;
    } catch (error) {
      console.error(`Error generating value for ${methodPath}:`, error);
      return "";
    }
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
    return faker.datatype.boolean() ? "true" : "false";
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
   * Set the locale for faker
   * @param locale - Locale code (e.g., 'ja', 'en', 'de')
   */
  setLocale(locale: string): void {
    this.locale = locale;
    // Note: In newer versions of faker, locale is set per-instance
    // For now, we'll track the locale but won't change the global faker instance
  }

  /**
   * Get current locale
   */
  getLocale(): string {
    return this.locale;
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

// Singleton instance
export const fakerGenerator = new FakerGenerator();
