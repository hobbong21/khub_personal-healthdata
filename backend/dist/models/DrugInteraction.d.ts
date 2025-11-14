import { DrugInteractionCheck, DrugInteractionData } from '../types/medication';
export declare class DrugInteractionModel {
    static create(interactionData: DrugInteractionData): Promise<any>;
    static checkInteraction(drug1: string, drug2: string): Promise<any | null>;
    static checkUserMedicationInteractions(userId: string): Promise<DrugInteractionCheck[]>;
    static checkNewMedicationInteractions(userId: string, newMedicationName: string, newMedicationGenericName?: string): Promise<DrugInteractionCheck[]>;
    static update(id: string, updateData: Partial<DrugInteractionData>): Promise<any>;
    static deactivate(id: string): Promise<void>;
    static getInteractionStats(userId: string): Promise<any>;
    static seedBasicInteractions(): Promise<void>;
}
//# sourceMappingURL=DrugInteraction.d.ts.map