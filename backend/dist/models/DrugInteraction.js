"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrugInteractionModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class DrugInteractionModel {
    static async create(interactionData) {
        return await database_1.default.drugInteraction.create({
            data: {
                drug1Name: interactionData.drug1Name.toLowerCase(),
                drug2Name: interactionData.drug2Name.toLowerCase(),
                interactionType: interactionData.interactionType,
                severity: interactionData.severity,
                description: interactionData.description,
                clinicalEffect: interactionData.clinicalEffect,
                mechanism: interactionData.mechanism,
                management: interactionData.management,
            }
        });
    }
    static async checkInteraction(drug1, drug2) {
        const drug1Lower = drug1.toLowerCase();
        const drug2Lower = drug2.toLowerCase();
        const interaction = await database_1.default.drugInteraction.findFirst({
            where: {
                isActive: true,
                OR: [
                    {
                        drug1Name: drug1Lower,
                        drug2Name: drug2Lower
                    },
                    {
                        drug1Name: drug2Lower,
                        drug2Name: drug1Lower
                    }
                ]
            }
        });
        return interaction;
    }
    static async checkUserMedicationInteractions(userId) {
        const medications = await database_1.default.medication.findMany({
            where: {
                userId,
                isActive: true
            },
            select: {
                id: true,
                name: true,
                genericName: true
            }
        });
        const interactions = [];
        for (let i = 0; i < medications.length; i++) {
            for (let j = i + 1; j < medications.length; j++) {
                const med1 = medications[i];
                const med2 = medications[j];
                let interaction = await this.checkInteraction(med1.name, med2.name);
                if (!interaction && med1.genericName && med2.genericName) {
                    interaction = await this.checkInteraction(med1.genericName, med2.genericName);
                }
                if (!interaction && med1.genericName) {
                    interaction = await this.checkInteraction(med1.genericName, med2.name);
                }
                if (!interaction && med2.genericName) {
                    interaction = await this.checkInteraction(med1.name, med2.genericName);
                }
                if (interaction) {
                    interactions.push({
                        medication1: {
                            id: med1.id,
                            name: med1.name,
                            genericName: med1.genericName
                        },
                        medication2: {
                            id: med2.id,
                            name: med2.name,
                            genericName: med2.genericName
                        },
                        interaction: {
                            id: interaction.id,
                            interactionType: interaction.interactionType,
                            severity: interaction.severity,
                            description: interaction.description,
                            clinicalEffect: interaction.clinicalEffect,
                            mechanism: interaction.mechanism,
                            management: interaction.management
                        }
                    });
                }
            }
        }
        return interactions;
    }
    static async checkNewMedicationInteractions(userId, newMedicationName, newMedicationGenericName) {
        const existingMedications = await database_1.default.medication.findMany({
            where: {
                userId,
                isActive: true
            },
            select: {
                id: true,
                name: true,
                genericName: true
            }
        });
        const interactions = [];
        for (const med of existingMedications) {
            let interaction = await this.checkInteraction(newMedicationName, med.name);
            if (!interaction && newMedicationGenericName && med.genericName) {
                interaction = await this.checkInteraction(newMedicationGenericName, med.genericName);
            }
            if (!interaction && newMedicationGenericName) {
                interaction = await this.checkInteraction(newMedicationGenericName, med.name);
            }
            if (!interaction && med.genericName) {
                interaction = await this.checkInteraction(newMedicationName, med.genericName);
            }
            if (interaction) {
                interactions.push({
                    medication1: {
                        id: 'new',
                        name: newMedicationName,
                        genericName: newMedicationGenericName
                    },
                    medication2: {
                        id: med.id,
                        name: med.name,
                        genericName: med.genericName
                    },
                    interaction: {
                        id: interaction.id,
                        interactionType: interaction.interactionType,
                        severity: interaction.severity,
                        description: interaction.description,
                        clinicalEffect: interaction.clinicalEffect,
                        mechanism: interaction.mechanism,
                        management: interaction.management
                    }
                });
            }
        }
        return interactions;
    }
    static async update(id, updateData) {
        return await database_1.default.drugInteraction.update({
            where: { id },
            data: {
                ...(updateData.interactionType && { interactionType: updateData.interactionType }),
                ...(updateData.severity && { severity: updateData.severity }),
                ...(updateData.description && { description: updateData.description }),
                ...(updateData.clinicalEffect !== undefined && { clinicalEffect: updateData.clinicalEffect }),
                ...(updateData.mechanism !== undefined && { mechanism: updateData.mechanism }),
                ...(updateData.management !== undefined && { management: updateData.management }),
            }
        });
    }
    static async deactivate(id) {
        await database_1.default.drugInteraction.update({
            where: { id },
            data: { isActive: false }
        });
    }
    static async getInteractionStats(userId) {
        const interactions = await this.checkUserMedicationInteractions(userId);
        const stats = {
            total: interactions.length,
            contraindicated: 0,
            serious: 0,
            significant: 0,
            minor: 0
        };
        interactions.forEach(interaction => {
            switch (interaction.interaction.severity) {
                case 'contraindicated':
                    stats.contraindicated++;
                    break;
                case 'serious':
                    stats.serious++;
                    break;
                case 'significant':
                    stats.significant++;
                    break;
                case 'minor':
                    stats.minor++;
                    break;
            }
        });
        return stats;
    }
    static async seedBasicInteractions() {
        const basicInteractions = [
            {
                drug1Name: 'warfarin',
                drug2Name: 'aspirin',
                interactionType: 'major',
                severity: 'serious',
                description: '출혈 위험 증가',
                clinicalEffect: '항응고 효과 증강으로 인한 출혈 위험 증가',
                mechanism: '혈소판 응집 억제 및 항응고 작용의 상승효과',
                management: '정기적인 INR 모니터링 및 출혈 징후 관찰'
            },
            {
                drug1Name: 'metformin',
                drug2Name: 'contrast media',
                interactionType: 'major',
                severity: 'serious',
                description: '유산산증 위험',
                clinicalEffect: '신기능 저하 시 메트포르민 축적으로 인한 유산산증',
                mechanism: '조영제로 인한 신기능 저하',
                management: '조영제 사용 전후 메트포르민 중단'
            },
            {
                drug1Name: 'digoxin',
                drug2Name: 'furosemide',
                interactionType: 'moderate',
                severity: 'significant',
                description: '디곡신 독성 위험',
                clinicalEffect: '저칼륨혈증으로 인한 디곡신 독성 증가',
                mechanism: '이뇨제로 인한 칼륨 손실',
                management: '칼륨 수치 모니터링 및 보충'
            }
        ];
        for (const interaction of basicInteractions) {
            await this.create(interaction);
        }
    }
}
exports.DrugInteractionModel = DrugInteractionModel;
//# sourceMappingURL=DrugInteraction.js.map