import { useState } from 'react';
import { fakerGenerator } from './fakerGenerator';
import { generateFieldValue, generateFormFields } from './fieldGenerators';
import type { FieldType } from './types';

/**
 * Hook for generating random form values using faker
 * @returns Object containing generator functions and current locale
 */
export function useFakerGenerator() {
  const [locale, setLocale] = useState(fakerGenerator.getLocale());

  /**
   * Generate a single random value
   */
  const generateValue = (fieldType: FieldType, fakerMethod?: string): string | number => {
    return fakerGenerator.generateByFieldType(fieldType, fakerMethod);
  };

  /**
   * Generate value for a specific field name
   */
  const generateForField = (fieldName: string, fieldType: FieldType): string | number => {
    return generateFieldValue(fieldName, fieldType);
  };

  /**
   * Generate multiple values
   */
  const generateValues = (
    fieldType: FieldType,
    count: number,
    fakerMethod?: string
  ): (string | number)[] => {
    return fakerGenerator.generateMultiple(fieldType, count, fakerMethod);
  };

  /**
   * Generate from schema
   */
  const generateFromSchema = <T extends Record<string, string | { type: FieldType; method?: string }>>(
    schema: T
  ): Record<string, string | number> => {
    return fakerGenerator.generateFromSchema(schema);
  };

  /**
   * Change the faker locale
   */
  const changeLocale = (newLocale: string) => {
    fakerGenerator.setLocale(newLocale);
    setLocale(newLocale);
  };

  return {
    locale,
    generateValue,
    generateForField,
    generateValues,
    generateFromSchema,
    changeLocale,
    // Direct access to generator methods
    generateEmail: () => fakerGenerator.generateEmail(),
    generatePhone: () => fakerGenerator.generatePhone(),
    generateText: () => fakerGenerator.generateText(),
    generateNumber: () => fakerGenerator.generateNumber(),
    generateDate: () => fakerGenerator.generateDate(),
    generateCompany: () => fakerGenerator.generateCompany(),
    generateAddress: () => fakerGenerator.generateAddress(),
    generateUsername: () => fakerGenerator.generateUsername(),
    generatePassword: () => fakerGenerator.generatePassword(),
    generateUrl: () => fakerGenerator.generateUrl(),
    generateUuid: () => fakerGenerator.generateUuid(),
    generateZipCode: () => fakerGenerator.generateZipCode(),
  };
}

/**
 * Hook for managing form preset generation
 */
export function useFormPresetGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Generate values for a complete form preset
   */
  const generatePreset = async (
    fields: Array<{ name: string; type: FieldType; fakerMethod?: string }>
  ): Promise<Record<string, string | number>> => {
    setIsGenerating(true);

    // Simulate async operation for better UX with loading states
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = generateFormFields(fields);
    setIsGenerating(false);

    return result;
  };

  return {
    isGenerating,
    generatePreset,
  };
}
