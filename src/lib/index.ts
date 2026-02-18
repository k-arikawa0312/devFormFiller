// Export all faker-related utilities
export { FakerGenerator } from './fakerGenerator';
export {
  generateFieldValue,
  generateFormFields,
  getFakerMethodForField,
  FIELD_METHOD_MAPPING,
  FAKER_CATEGORIES,
  type FakerCategory,
} from './fieldGenerators';

// Export hooks
export { useFakerGenerator, useFormPresetGenerator } from './useFakerGenerator';

// Export chrome utilities
export { isChromeExtensionContext, safeStorageGet, safeStorageSet } from './chromeUtils';

// Export types
export type { FieldType, ValueStrategy, FieldRule, FormPreset, InjectionResult } from './types';
