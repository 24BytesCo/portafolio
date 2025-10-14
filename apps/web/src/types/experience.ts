export interface Experience {
  name: string;
  company: string;
  duration: string;
  description?: string;
  highlights?: string[];
  // Optional company logo path or URL (e.g., "/images/logos/company.svg")
  logo?: string;
}
