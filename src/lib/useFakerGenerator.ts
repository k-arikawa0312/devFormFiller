import { useState } from 'react';
import { FakerGenerator } from './fakerGenerator';
import { generateFieldValue, generateFormFields } from './fieldGenerators';
import type { FieldType } from './types';

/**
 * Hook for generating random form values using faker
 * @returns Object containing generator functions
 */
export function useFakerGenerator() {
  const [generator] = useState(() => new FakerGenerator());

  /**
   * Generate a single random value
   */
  const generateValue = (fieldType: FieldType, fakerMethod?: string): string | number => {
    return generator.generateByFieldType(fieldType, fakerMethod);
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
    return generator.generateMultiple(fieldType, count, fakerMethod);
  };

  /**
   * Generate from schema
   */
  const generateFromSchema = <T extends Record<string, string | { type: FieldType; method?: string }>>(
    schema: T
  ): Record<string, string | number> => {
    return generator.generateFromSchema(schema);
  };

  return {
    generateValue,
    generateForField,
    generateValues,
    generateFromSchema,
    // Direct access to generator methods
    generateEmail: () => generator.generateEmail(),
    generatePhone: () => generator.generatePhone(),
    generateText: () => generator.generateText(),
    generateNumber: () => generator.generateNumber(),
    generateDate: () => generator.generateDate(),
    generateCompany: () => generator.generateCompany(),
    generateAddress: () => generator.generateAddress(),
    generateUsername: () => generator.generateUsername(),
    generatePassword: () => generator.generatePassword(),
    generateUrl: () => generator.generateUrl(),
    generateUuid: () => generator.generateUuid(),
    generateZipCode: () => generator.generateZipCode(),
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
  const generatePreset = (
    fields: Array<{ name: string; type: FieldType; fakerMethod?: string }>
  ): Record<string, string | number> => {
    setIsGenerating(true);
    const result = generateFormFields(fields);
    setIsGenerating(false);

    return result;
  };

  return {
    isGenerating,
    generatePreset,
  };
}
