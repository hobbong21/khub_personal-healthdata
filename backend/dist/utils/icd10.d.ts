export interface ICD10Code {
    code: string;
    description: string;
    category: string;
    subcategory?: string;
}
export declare function validateICD10Code(code: string): boolean;
export declare function normalizeICD10Code(code: string): string;
export declare function getICD10Category(code: string): string;
export declare const SAMPLE_ICD10_CODES: ICD10Code[];
export declare function searchICD10Codes(searchTerm: string, limit?: number): ICD10Code[];
export declare function getICD10CodeDetails(code: string): ICD10Code | null;
export declare function validateAndSuggestICD10(code: string): {
    isValid: boolean;
    normalizedCode?: string;
    suggestions?: ICD10Code[];
    error?: string;
};
//# sourceMappingURL=icd10.d.ts.map