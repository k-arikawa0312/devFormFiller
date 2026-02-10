export type FieldType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "select"
  | "checkbox";

export type ValueStrategy = "static" | "faker";

export interface FieldRule {
  id: string;
  selector: string; // CSS selector or attribute name
  type: FieldType;
  valueStrategy: ValueStrategy;
  staticValue?: string;
  fakerMethod?: string; // e.g., "person.fullName", "internet.email"
}

export interface FormPreset {
  id: string;
  name: string;
  urlPattern: string;
  autoSubmit: boolean;
  fields: FieldRule[];
}

export interface InjectionResult {
  fieldId: string;
  matched: boolean;
  selectorTried: string;
  reason?: string;
}
