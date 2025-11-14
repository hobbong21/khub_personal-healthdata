"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneticConditionModel = void 0;
const client_1 = require("@prisma/client");
const familyHistory_1 = require("../types/familyHistory");
const prisma = new client_1.PrismaClient();
class GeneticConditionModel {
    static async createGeneticCondition(data) {
        const condition = await prisma.geneticCondition.create({
            data: {
                name: data.name,
                icd10Code: data.icd10Code,
                category: data.category,
                inheritancePattern: data.inheritancePattern,
                prevalence: data.prevalence,
                penetrance: data.penetrance,
                description: data.description,
                riskFactors: data.riskFactors || [],
                symptoms: data.symptoms || [],
                isHereditary: data.isHereditary
            }
        });
        return this.mapPrismaToGeneticCondition(condition);
    }
    static async getAllGeneticConditions() {
        const conditions = await prisma.geneticCondition.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });
        return conditions.map(this.mapPrismaToGeneticCondition);
    }
    static async getGeneticConditionsByCategory(category) {
        const conditions = await prisma.geneticCondition.findMany({
            where: { category },
            orderBy: { name: 'asc' }
        });
        return conditions.map(this.mapPrismaToGeneticCondition);
    }
    static async getHereditaryConditions() {
        const conditions = await prisma.geneticCondition.findMany({
            where: { isHereditary: true },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });
        return conditions.map(this.mapPrismaToGeneticCondition);
    }
    static async searchGeneticConditions(searchTerm) {
        const conditions = await prisma.geneticCondition.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                    { icd10Code: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            orderBy: { name: 'asc' }
        });
        return conditions.map(this.mapPrismaToGeneticCondition);
    }
    static async getGeneticConditionByName(name) {
        const condition = await prisma.geneticCondition.findUnique({
            where: { name }
        });
        return condition ? this.mapPrismaToGeneticCondition(condition) : null;
    }
    static async updateGeneticCondition(id, data) {
        try {
            const condition = await prisma.geneticCondition.update({
                where: { id },
                data
            });
            return this.mapPrismaToGeneticCondition(condition);
        }
        catch (error) {
            return null;
        }
    }
    static async deleteGeneticCondition(id) {
        try {
            await prisma.geneticCondition.delete({
                where: { id }
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static async getConditionsByInheritancePattern(pattern) {
        const conditions = await prisma.geneticCondition.findMany({
            where: { inheritancePattern: pattern },
            orderBy: { name: 'asc' }
        });
        return conditions.map(this.mapPrismaToGeneticCondition);
    }
    static async getHighRiskConditions(minPrevalence = 0.01, minPenetrance = 0.5) {
        const conditions = await prisma.geneticCondition.findMany({
            where: {
                OR: [
                    { prevalence: { gte: minPrevalence } },
                    { penetrance: { gte: minPenetrance } }
                ],
                isHereditary: true
            },
            orderBy: [
                { prevalence: 'desc' },
                { penetrance: 'desc' }
            ]
        });
        return conditions.map(this.mapPrismaToGeneticCondition);
    }
    static async seedCommonGeneticConditions() {
        const commonConditions = [
            {
                name: 'Hypertrophic Cardiomyopathy',
                category: familyHistory_1.GENETIC_CONDITION_CATEGORIES.CARDIOVASCULAR,
                inheritancePattern: 'autosomal_dominant',
                prevalence: 0.002,
                penetrance: 0.8,
                isHereditary: true,
                description: 'A genetic condition causing thickening of the heart muscle',
                riskFactors: ['Family history', 'Male gender', 'Age'],
                symptoms: ['Chest pain', 'Shortness of breath', 'Fainting', 'Heart palpitations']
            },
            {
                name: 'Familial Hypercholesterolemia',
                category: familyHistory_1.GENETIC_CONDITION_CATEGORIES.CARDIOVASCULAR,
                inheritancePattern: 'autosomal_dominant',
                prevalence: 0.003,
                penetrance: 0.9,
                isHereditary: true,
                description: 'Genetic disorder causing high cholesterol levels',
                riskFactors: ['Family history', 'Diet', 'Lifestyle'],
                symptoms: ['High cholesterol', 'Early heart disease', 'Xanthomas']
            },
            {
                name: 'BRCA1/BRCA2 Breast Cancer',
                category: familyHistory_1.GENETIC_CONDITION_CATEGORIES.CANCER,
                inheritancePattern: 'autosomal_dominant',
                prevalence: 0.0025,
                penetrance: 0.7,
                isHereditary: true,
                description: 'Hereditary breast and ovarian cancer syndrome',
                riskFactors: ['Family history', 'Female gender', 'Age'],
                symptoms: ['Breast lumps', 'Breast pain', 'Changes in breast appearance']
            },
            {
                name: 'Lynch Syndrome',
                category: familyHistory_1.GENETIC_CONDITION_CATEGORIES.CANCER,
                inheritancePattern: 'autosomal_dominant',
                prevalence: 0.003,
                penetrance: 0.8,
                isHereditary: true,
                description: 'Hereditary colorectal cancer syndrome',
                riskFactors: ['Family history', 'Age', 'Diet'],
                symptoms: ['Colorectal polyps', 'Early colorectal cancer', 'Endometrial cancer']
            },
            {
                name: 'Huntington Disease',
                category: familyHistory_1.GENETIC_CONDITION_CATEGORIES.NEUROLOGICAL,
                inheritancePattern: 'autosomal_dominant',
                prevalence: 0.00005,
                penetrance: 1.0,
                isHereditary: true,
                description: 'Progressive neurodegenerative disorder',
                riskFactors: ['Family history', 'CAG repeat expansion'],
                symptoms: ['Movement disorders', 'Cognitive decline', 'Psychiatric symptoms']
            },
            {
                name: 'Alzheimer Disease (Early-Onset)',
                category: familyHistory_1.GENETIC_CONDITION_CATEGORIES.NEUROLOGICAL,
                inheritancePattern: 'autosomal_dominant',
                prevalence: 0.0001,
                penetrance: 0.9,
                isHereditary: true,
                description: 'Early-onset familial Alzheimer disease',
                riskFactors: ['Family history', 'Age', 'APOE genotype'],
                symptoms: ['Memory loss', 'Cognitive decline', 'Behavioral changes']
            },
            {
                name: 'Type 1 Diabetes',
                category: familyHistory_1.GENETIC_CONDITION_CATEGORIES.METABOLIC,
                inheritancePattern: 'multifactorial',
                prevalence: 0.005,
                penetrance: 0.3,
                isHereditary: true,
                description: 'Autoimmune destruction of pancreatic beta cells',
                riskFactors: ['Family history', 'HLA genotype', 'Environmental factors'],
                symptoms: ['High blood sugar', 'Frequent urination', 'Excessive thirst', 'Weight loss']
            },
            {
                name: 'Hemochromatosis',
                category: familyHistory_1.GENETIC_CONDITION_CATEGORIES.METABOLIC,
                inheritancePattern: 'autosomal_recessive',
                prevalence: 0.005,
                penetrance: 0.4,
                isHereditary: true,
                description: 'Iron overload disorder',
                riskFactors: ['Family history', 'Male gender', 'Age'],
                symptoms: ['Fatigue', 'Joint pain', 'Skin darkening', 'Liver problems']
            }
        ];
        for (const condition of commonConditions) {
            const existing = await prisma.geneticCondition.findUnique({
                where: { name: condition.name }
            });
            if (!existing) {
                await prisma.geneticCondition.create({
                    data: condition
                });
            }
        }
    }
    static mapPrismaToGeneticCondition(prismaCondition) {
        return {
            id: prismaCondition.id,
            name: prismaCondition.name,
            icd10Code: prismaCondition.icd10Code || undefined,
            category: prismaCondition.category,
            inheritancePattern: prismaCondition.inheritancePattern,
            prevalence: prismaCondition.prevalence || undefined,
            penetrance: prismaCondition.penetrance || undefined,
            description: prismaCondition.description || undefined,
            riskFactors: prismaCondition.riskFactors || [],
            symptoms: prismaCondition.symptoms || [],
            isHereditary: prismaCondition.isHereditary,
            createdAt: prismaCondition.createdAt,
            updatedAt: prismaCondition.updatedAt
        };
    }
}
exports.GeneticConditionModel = GeneticConditionModel;
exports.default = GeneticConditionModel;
//# sourceMappingURL=GeneticCondition.js.map