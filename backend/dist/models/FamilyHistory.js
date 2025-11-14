"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyHistoryModel = void 0;
const client_1 = require("@prisma/client");
const familyHistory_1 = require("../types/familyHistory");
const prisma = new client_1.PrismaClient();
class FamilyHistoryModel {
    static async createFamilyMember(userId, data) {
        const generation = data.generation ?? this.getGenerationFromRelationship(data.relationship);
        const position = data.position ?? await this.getNextPositionInGeneration(userId, generation);
        const familyMember = await prisma.familyHistory.create({
            data: {
                userId,
                relationship: data.relationship,
                name: data.name,
                gender: data.gender,
                birthYear: data.birthYear,
                deathYear: data.deathYear,
                isAlive: data.isAlive ?? true,
                generation,
                position,
                parentId: data.parentId,
                conditions: data.conditions || [],
                causeOfDeath: data.causeOfDeath,
                notes: data.notes
            }
        });
        return this.mapPrismaToFamilyMember(familyMember);
    }
    static async getFamilyMembers(userId) {
        const familyMembers = await prisma.familyHistory.findMany({
            where: { userId },
            orderBy: [
                { generation: 'asc' },
                { position: 'asc' }
            ]
        });
        return familyMembers.map(this.mapPrismaToFamilyMember);
    }
    static async getFamilyMemberById(id, userId) {
        const familyMember = await prisma.familyHistory.findFirst({
            where: { id, userId }
        });
        return familyMember ? this.mapPrismaToFamilyMember(familyMember) : null;
    }
    static async updateFamilyMember(id, userId, data) {
        const updateData = { ...data };
        if (data.relationship) {
            updateData.generation = this.getGenerationFromRelationship(data.relationship);
        }
        const familyMember = await prisma.familyHistory.updateMany({
            where: { id, userId },
            data: updateData
        });
        if (familyMember.count === 0) {
            return null;
        }
        return this.getFamilyMemberById(id, userId);
    }
    static async deleteFamilyMember(id, userId) {
        const result = await prisma.familyHistory.deleteMany({
            where: { id, userId }
        });
        return result.count > 0;
    }
    static async getFamilyTree(userId) {
        const familyMembers = await this.getFamilyMembers(userId);
        const memberMap = new Map();
        familyMembers.forEach(member => {
            memberMap.set(member.id, {
                id: member.id,
                name: member.name,
                gender: member.gender,
                relationship: member.relationship,
                generation: member.generation,
                position: member.position,
                isAlive: member.isAlive,
                birthYear: member.birthYear,
                deathYear: member.deathYear,
                conditions: member.conditions || [],
                children: []
            });
        });
        const rootNodes = [];
        familyMembers.forEach(member => {
            const node = memberMap.get(member.id);
            if (member.parentId) {
                const parent = memberMap.get(member.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            }
            else {
                rootNodes.push(node);
            }
        });
        return rootNodes.sort((a, b) => {
            if (a.generation !== b.generation) {
                return a.generation - b.generation;
            }
            return a.position - b.position;
        });
    }
    static async getFamilyMembersByGeneration(userId, generation) {
        const familyMembers = await prisma.familyHistory.findMany({
            where: { userId, generation },
            orderBy: { position: 'asc' }
        });
        return familyMembers.map(this.mapPrismaToFamilyMember);
    }
    static async getFamilyMembersWithCondition(userId, conditionName) {
        const familyMembers = await prisma.familyHistory.findMany({
            where: {
                userId,
                conditions: {
                    path: '$[*].name',
                    array_contains: conditionName
                }
            }
        });
        return familyMembers.map(this.mapPrismaToFamilyMember);
    }
    static async getCommonFamilyConditions(userId) {
        const familyMembers = await this.getFamilyMembers(userId);
        const conditionMap = new Map();
        familyMembers.forEach(member => {
            const conditions = member.conditions || [];
            conditions.forEach((condition) => {
                if (!conditionMap.has(condition.name)) {
                    conditionMap.set(condition.name, { count: 0, members: [] });
                }
                const entry = conditionMap.get(condition.name);
                entry.count++;
                entry.members.push(member.name || member.relationship);
            });
        });
        return Array.from(conditionMap.entries())
            .map(([condition, data]) => ({
            condition,
            count: data.count,
            members: data.members
        }))
            .sort((a, b) => b.count - a.count);
    }
    static async getFamilyHistoryStats(userId) {
        const familyMembers = await this.getFamilyMembers(userId);
        const livingMembers = familyMembers.filter(m => m.isAlive).length;
        const deceasedMembers = familyMembers.filter(m => !m.isAlive).length;
        const generations = new Set(familyMembers.map(m => m.generation));
        const commonConditions = await this.getCommonFamilyConditions(userId);
        return {
            totalMembers: familyMembers.length,
            livingMembers,
            deceasedMembers,
            generationsTracked: generations.size,
            commonConditions: commonConditions.map(c => ({
                condition: c.condition,
                count: c.count,
                percentage: (c.count / familyMembers.length) * 100
            }))
        };
    }
    static getGenerationFromRelationship(relationship) {
        const relationshipGenerationMap = {
            [familyHistory_1.FAMILY_RELATIONSHIPS.PATERNAL_GRANDFATHER]: -2,
            [familyHistory_1.FAMILY_RELATIONSHIPS.PATERNAL_GRANDMOTHER]: -2,
            [familyHistory_1.FAMILY_RELATIONSHIPS.MATERNAL_GRANDFATHER]: -2,
            [familyHistory_1.FAMILY_RELATIONSHIPS.MATERNAL_GRANDMOTHER]: -2,
            [familyHistory_1.FAMILY_RELATIONSHIPS.FATHER]: -1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.MOTHER]: -1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.STEPFATHER]: -1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.STEPMOTHER]: -1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.UNCLE]: -1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.AUNT]: -1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.BROTHER]: 0,
            [familyHistory_1.FAMILY_RELATIONSHIPS.SISTER]: 0,
            [familyHistory_1.FAMILY_RELATIONSHIPS.HALF_BROTHER]: 0,
            [familyHistory_1.FAMILY_RELATIONSHIPS.HALF_SISTER]: 0,
            [familyHistory_1.FAMILY_RELATIONSHIPS.STEPBROTHER]: 0,
            [familyHistory_1.FAMILY_RELATIONSHIPS.STEPSISTER]: 0,
            [familyHistory_1.FAMILY_RELATIONSHIPS.COUSIN]: 0,
            [familyHistory_1.FAMILY_RELATIONSHIPS.SON]: 1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.DAUGHTER]: 1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.STEPSON]: 1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.STEPDAUGHTER]: 1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.NEPHEW]: 1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.NIECE]: 1,
            [familyHistory_1.FAMILY_RELATIONSHIPS.GRANDSON]: 2,
            [familyHistory_1.FAMILY_RELATIONSHIPS.GRANDDAUGHTER]: 2
        };
        return relationshipGenerationMap[relationship] || 0;
    }
    static async getNextPositionInGeneration(userId, generation) {
        const maxPosition = await prisma.familyHistory.findFirst({
            where: { userId, generation },
            orderBy: { position: 'desc' },
            select: { position: true }
        });
        return (maxPosition?.position || 0) + 1;
    }
    static mapPrismaToFamilyMember(prismaFamilyHistory) {
        return {
            id: prismaFamilyHistory.id,
            userId: prismaFamilyHistory.userId,
            relationship: prismaFamilyHistory.relationship,
            name: prismaFamilyHistory.name || undefined,
            gender: prismaFamilyHistory.gender,
            birthYear: prismaFamilyHistory.birthYear || undefined,
            deathYear: prismaFamilyHistory.deathYear || undefined,
            isAlive: prismaFamilyHistory.isAlive,
            generation: prismaFamilyHistory.generation,
            position: prismaFamilyHistory.position,
            parentId: prismaFamilyHistory.parentId || undefined,
            conditions: prismaFamilyHistory.conditions || [],
            causeOfDeath: prismaFamilyHistory.causeOfDeath || undefined,
            notes: prismaFamilyHistory.notes || undefined,
            createdAt: prismaFamilyHistory.createdAt,
            updatedAt: prismaFamilyHistory.updatedAt
        };
    }
}
exports.FamilyHistoryModel = FamilyHistoryModel;
exports.default = FamilyHistoryModel;
//# sourceMappingURL=FamilyHistory.js.map