import prisma from '../lib/prisma.js';
import type { RoleType, Prisma } from '../generated/prisma/client.js';

/**
 * Company Service
 * Multi-company/multi-tenant support
 */

export interface CreateCompanyInput {
    name: string;
    nameNe?: string; // Nepali name
    panNumber?: string;
    vatNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    fiscalYearStart?: number; // Month (1-12)
    currency?: string;
    vatRate?: number;
}

export interface InviteMemberInput {
    email: string;
    role: RoleType;
}

export const companyService = {
    /**
     * Create a new company
     */
    async createCompany(userId: string, data: CreateCompanyInput) {
        const company = await prisma.company.create({
            data: {
                name: data.name,
                nameNe: data.nameNe,
                panNumber: data.panNumber,
                vatNumber: data.vatNumber,
                address: data.address,
                phone: data.phone,
                email: data.email,
                logoUrl: data.logoUrl,
                fiscalYearStart: data.fiscalYearStart ?? 4,
                currency: data.currency ?? 'NPR',
                vatRate: data.vatRate ?? 13.00,
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                        isDefault: true,
                        isActive: true,
                    },
                },
            },
            include: {
                members: true,
            },
        });

        return company;
    },

    /**
     * Get all companies for a user
     */
    async getUserCompanies(userId: string) {
        const memberships = await prisma.companyMember.findMany({
            where: {
                userId,
                isActive: true,
                company: { isActive: true },
            },
            include: {
                company: true,
            },
            orderBy: {
                company: { name: 'asc' },
            },
        });

        return memberships.map((m: Prisma.CompanyMemberGetPayload<{ include: { company: true } }>) => ({
            ...m.company,
            role: m.role,
            isDefault: m.isDefault,
            membershipId: m.id,
        }));
    },

    /**
     * Get a single company by ID (with permission check)
     */
    async getCompany(companyId: string, userId: string) {
        const membership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId,
                isActive: true,
            },
            include: {
                company: {
                    include: {
                        members: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });

        if (!membership || !membership.company.isActive) {
            return null;
        }

        return {
            ...membership.company,
            userRole: membership.role,
        };
    },

    /**
     * Update company details
     */
    async updateCompany(companyId: string, userId: string, data: Partial<CreateCompanyInput>) {
        const membership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId,
                isActive: true,
                role: { in: ['OWNER', 'MANAGER'] },
            },
        });

        if (!membership) {
            throw new Error('Permission denied');
        }

        const company = await prisma.company.update({
            where: { id: companyId },
            data: {
                name: data.name,
                nameNe: data.nameNe,
                panNumber: data.panNumber,
                vatNumber: data.vatNumber,
                address: data.address,
                phone: data.phone,
                email: data.email,
                logoUrl: data.logoUrl,
                fiscalYearStart: data.fiscalYearStart,
                currency: data.currency,
                vatRate: data.vatRate,
            },
        });

        return company;
    },

    /**
     * Delete a company (OWNER only)
     */
    async deleteCompany(companyId: string, userId: string) {
        const membership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId,
                isActive: true,
                role: 'OWNER',
            },
        });

        if (!membership) {
            throw new Error('Only company owner can delete the company');
        }

        await prisma.company.update({
            where: { id: companyId },
            data: { isActive: false },
        });

        return { success: true };
    },

    /**
     * Invite a member to the company
     */
    async inviteMember(companyId: string, inviterId: string, data: InviteMemberInput) {
        const inviterMembership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId: inviterId,
                isActive: true,
                role: { in: ['OWNER', 'MANAGER'] },
            },
        });

        if (!inviterMembership) {
            throw new Error('Permission denied');
        }

        if (inviterMembership.role !== 'OWNER' && data.role === 'OWNER') {
            throw new Error('Only owners can create owner roles');
        }

        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new Error('User not found. They must register first.');
        }

        const existingMembership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId: user.id,
            },
        });

        if (existingMembership) {
            if (existingMembership.isActive) {
                throw new Error('User is already a member of this company');
            }
            const membership = await prisma.companyMember.update({
                where: { id: existingMembership.id },
                data: {
                    role: data.role,
                    isActive: true,
                },
            });
            return { ...membership, userEmail: user.email, userName: user.businessName };
        }

        const membership = await prisma.companyMember.create({
            data: {
                companyId,
                userId: user.id,
                role: data.role,
                isActive: true,
            },
        });

        return { ...membership, userEmail: user.email, userName: user.businessName };
    },

    /**
     * Update member role
     */
    async updateMemberRole(
        companyId: string,
        memberId: string,
        updaterId: string,
        newRole: RoleType
    ) {
        const updaterMembership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId: updaterId,
                isActive: true,
                role: { in: ['OWNER', 'MANAGER'] },
            },
        });

        if (!updaterMembership) {
            throw new Error('Permission denied');
        }

        const targetMember = await prisma.companyMember.findUnique({
            where: { id: memberId },
        });

        if (!targetMember || targetMember.companyId !== companyId) {
            throw new Error('Member not found');
        }

        if (updaterMembership.role !== 'OWNER') {
            if (targetMember.role === 'OWNER' || newRole === 'OWNER') {
                throw new Error('Only owners can change owner roles');
            }
        }

        if (targetMember.role === 'OWNER' && newRole !== 'OWNER') {
            const ownerCount = await prisma.companyMember.count({
                where: {
                    companyId,
                    role: 'OWNER',
                    isActive: true,
                },
            });
            if (ownerCount <= 1) {
                throw new Error('Cannot demote the last owner');
            }
        }

        const updated = await prisma.companyMember.update({
            where: { id: memberId },
            data: { role: newRole },
        });

        return updated;
    },

    /**
     * Remove a member from the company
     */
    async removeMember(companyId: string, memberId: string, removerId: string) {
        const removerMembership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId: removerId,
                isActive: true,
                role: { in: ['OWNER', 'MANAGER'] },
            },
        });

        if (!removerMembership) {
            throw new Error('Permission denied');
        }

        const targetMember = await prisma.companyMember.findUnique({
            where: { id: memberId },
        });

        if (!targetMember || targetMember.companyId !== companyId) {
            throw new Error('Member not found');
        }

        if (targetMember.role === 'OWNER' && removerMembership.role !== 'OWNER') {
            throw new Error('Only owners can remove owners');
        }

        if (targetMember.role === 'OWNER') {
            const ownerCount = await prisma.companyMember.count({
                where: {
                    companyId,
                    role: 'OWNER',
                    isActive: true,
                },
            });
            if (ownerCount <= 1) {
                throw new Error('Cannot remove the last owner');
            }
        }

        await prisma.companyMember.update({
            where: { id: memberId },
            data: { isActive: false },
        });

        return { success: true };
    },

    /**
     * Leave a company (self-removal)
     */
    async leaveCompany(companyId: string, userId: string) {
        const membership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId,
                isActive: true,
            },
        });

        if (!membership) {
            throw new Error('Not a member of this company');
        }

        if (membership.role === 'OWNER') {
            const ownerCount = await prisma.companyMember.count({
                where: {
                    companyId,
                    role: 'OWNER',
                    isActive: true,
                },
            });
            if (ownerCount <= 1) {
                throw new Error('Cannot leave as the last owner. Transfer ownership first.');
            }
        }

        await prisma.companyMember.update({
            where: { id: membership.id },
            data: { isActive: false },
        });

        return { success: true };
    },

    /**
     * Get company members
     */
    async getMembers(companyId: string, userId: string) {
        const membership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId,
                isActive: true,
            },
        });

        if (!membership) {
            throw new Error('Not a member of this company');
        }

        const members: Prisma.CompanyMemberGetPayload<{}>[] = await prisma.companyMember.findMany({
            where: {
                companyId,
                isActive: true,
            },
            orderBy: [
                { role: 'asc' },
                { createdAt: 'asc' },
            ],
        });

        const userIds = members.map((m: Prisma.CompanyMemberGetPayload<{}>) => m.userId);
        const users: Array<{ id: string; businessName: string | null; email: string | null }> = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, businessName: true, email: true },
        });

        const userMap = new Map<string, { id: string; businessName: string | null; email: string | null }>(
            users.map((u) => [u.id, u])
        );

        return members.map((m: Prisma.CompanyMemberGetPayload<{}>) => {
            const user = userMap.get(m.userId);
            return {
                ...m,
                userName: user?.businessName || 'Unknown',
                userEmail: user?.email || '',
            };
        });
    },

    /**
     * Set default company for user
     */
    async setDefaultCompany(companyId: string, userId: string) {
        const membership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId,
                isActive: true,
            },
        });

        if (!membership) {
            throw new Error('Not a member of this company');
        }

        await prisma.companyMember.updateMany({
            where: {
                userId,
                isDefault: true,
            },
            data: { isDefault: false },
        });

        await prisma.companyMember.update({
            where: { id: membership.id },
            data: { isDefault: true },
        });

        return { success: true };
    },

    /**
     * Get user's default company
     */
    async getDefaultCompany(userId: string) {
        const membership = await prisma.companyMember.findFirst({
            where: {
                userId,
                isActive: true,
                isDefault: true,
                company: { isActive: true },
            },
            include: {
                company: true,
            },
        });

        if (membership?.company) {
            return {
                ...membership.company,
                role: membership.role,
            };
        }

        // If no default, return first active company
        const firstMembership = await prisma.companyMember.findFirst({
            where: {
                userId,
                isActive: true,
                company: { isActive: true },
            },
            include: {
                company: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        if (firstMembership?.company) {
            // Set as default
            await prisma.companyMember.update({
                where: { id: firstMembership.id },
                data: { isDefault: true },
            });

            return {
                ...firstMembership.company,
                role: firstMembership.role,
            };
        }

        return null;
    },

    /**
     * Check if user has permission for an action
     */
    async checkPermission(
        companyId: string,
        userId: string,
        requiredRoles: RoleType[]
    ): Promise<boolean> {
        const membership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId,
                isActive: true,
                role: { in: requiredRoles },
            },
        });

        return !!membership;
    },
};

export default companyService;
