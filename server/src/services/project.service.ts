import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { ProjectStatus, ProjectEntryType, Project } from '@prisma/client';

/**
 * Project service - Project tracking and billing
 */

export interface CreateProjectInput {
    name: string;
    nameNe?: string;
    code: string;
    description?: string;
    customerId?: string;
    budget?: number;
    currency?: string;
    startDate?: string;
    endDate?: string;
    billable?: boolean;
    billingRate?: number;
    billingType?: string;
    category?: string;
    tags?: string[];
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
    status?: ProjectStatus;
}

export interface ProjectQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProjectStatus;
    customerId?: string;
    category?: string;
}

export interface CreateProjectEntryInput {
    type: ProjectEntryType;
    description: string;
    notes?: string;
    amount?: number;
    hours?: number;
    date?: string;
    invoiceId?: string;
    expenseId?: string;
    isBillable?: boolean;
}

export const projectService = {
    /**
     * Create a new project
     */
    async createProject(userId: string, data: CreateProjectInput) {
        // Check for duplicate code
        const existing = await prisma.project.findUnique({
            where: { userId_code: { userId, code: data.code } },
        });

        if (existing) {
            throw new ApiError(409, 'DUPLICATE_CODE', `Project with code "${data.code}" already exists`);
        }

        const project = await prisma.project.create({
            data: {
                userId,
                name: data.name,
                nameNe: data.nameNe,
                code: data.code,
                description: data.description,
                customerId: data.customerId,
                budget: data.budget ? new Decimal(data.budget) : undefined,
                currency: data.currency ?? 'NPR',
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                billable: data.billable ?? true,
                billingRate: data.billingRate ? new Decimal(data.billingRate) : undefined,
                billingType: data.billingType,
                category: data.category,
                tags: data.tags ?? [],
            },
        });

        return project;
    },

    /**
     * Get all projects with filters
     */
    async getProjects(userId: string, query: ProjectQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { userId };

        if (query.status) {
            where.status = query.status;
        }

        if (query.customerId) {
            where.customerId = query.customerId;
        }

        if (query.category) {
            where.category = query.category;
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    _count: {
                        select: { entries: true },
                    },
                },
            }),
            prisma.project.count({ where }),
        ]);

        return {
            projects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get single project with entries
     */
    async getProject(userId: string, projectId: string) {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId },
            include: {
                entries: {
                    orderBy: { date: 'desc' },
                    take: 50,
                },
            },
        });

        if (!project) {
            throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
        }

        // Calculate totals
        const entries = await prisma.projectEntry.groupBy({
            by: ['type'],
            where: { projectId },
            _sum: { amount: true, hours: true },
        });

        const totals = {
            revenue: 0,
            expenses: 0,
            hours: 0,
            profit: 0,
        };

        for (const entry of entries) {
            if (entry.type === 'REVENUE') {
                totals.revenue = Number(entry._sum.amount ?? 0);
            } else if (entry.type === 'EXPENSE') {
                totals.expenses = Number(entry._sum.amount ?? 0);
            }
            totals.hours += Number(entry._sum.hours ?? 0);
        }
        totals.profit = totals.revenue - totals.expenses;

        return { ...project, totals };
    },

    /**
     * Update project
     */
    async updateProject(userId: string, projectId: string, data: UpdateProjectInput) {
        const existing = await prisma.project.findFirst({
            where: { id: projectId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
        }

        // Check for duplicate code if changing
        if (data.code && data.code !== existing.code) {
            const duplicate = await prisma.project.findUnique({
                where: { userId_code: { userId, code: data.code } },
            });
            if (duplicate) {
                throw new ApiError(409, 'DUPLICATE_CODE', `Project with code "${data.code}" already exists`);
            }
        }

        const project = await prisma.project.update({
            where: { id: projectId },
            data: {
                name: data.name,
                nameNe: data.nameNe,
                code: data.code,
                description: data.description,
                customerId: data.customerId,
                budget: data.budget !== undefined ? new Decimal(data.budget) : undefined,
                currency: data.currency,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                status: data.status,
                billable: data.billable,
                billingRate: data.billingRate !== undefined ? new Decimal(data.billingRate) : undefined,
                billingType: data.billingType,
                category: data.category,
                tags: data.tags,
            },
        });

        return project;
    },

    /**
     * Delete project
     */
    async deleteProject(userId: string, projectId: string) {
        const existing = await prisma.project.findFirst({
            where: { id: projectId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
        }

        await prisma.project.delete({
            where: { id: projectId },
        });

        return { message: 'Project deleted successfully' };
    },

    /**
     * Add entry to project
     */
    async addEntry(userId: string, projectId: string, data: CreateProjectEntryInput) {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId },
        });

        if (!project) {
            throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
        }

        const entry = await prisma.projectEntry.create({
            data: {
                projectId,
                type: data.type,
                description: data.description,
                notes: data.notes,
                amount: data.amount ? new Decimal(data.amount) : undefined,
                hours: data.hours ? new Decimal(data.hours) : undefined,
                date: data.date ? new Date(data.date) : new Date(),
                invoiceId: data.invoiceId,
                expenseId: data.expenseId,
                isBillable: data.isBillable ?? true,
                createdBy: userId,
            },
        });

        return entry;
    },

    /**
     * Get project entries
     */
    async getEntries(userId: string, projectId: string, page = 1, limit = 50) {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId },
        });

        if (!project) {
            throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
        }

        const skip = (page - 1) * limit;

        const [entries, total] = await Promise.all([
            prisma.projectEntry.findMany({
                where: { projectId },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            prisma.projectEntry.count({ where: { projectId } }),
        ]);

        return {
            entries,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Delete project entry
     */
    async deleteEntry(userId: string, projectId: string, entryId: string) {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId },
        });

        if (!project) {
            throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
        }

        const entry = await prisma.projectEntry.findFirst({
            where: { id: entryId, projectId },
        });

        if (!entry) {
            throw new ApiError(404, 'ENTRY_NOT_FOUND', 'Project entry not found');
        }

        await prisma.projectEntry.delete({
            where: { id: entryId },
        });

        return { message: 'Entry deleted successfully' };
    },

    /**
     * Get project summary for dashboard
     */
    async getProjectsSummary(userId: string) {
        const projects = await prisma.project.findMany({
            where: { userId },
        });

        const byStatus = projects.reduce((acc: Record<string, number>, p: Project) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {});

        const totalBudget = projects.reduce((sum: number, p: Project) => sum + Number(p.budget ?? 0), 0);
        const billableProjects = projects.filter((p: Project) => p.billable).length;

        // Get revenue and expenses across all projects
        const revenueEntries = await prisma.projectEntry.aggregate({
            where: {
                type: 'REVENUE',
                project: { userId },
            },
            _sum: { amount: true },
        });

        const expenseEntries = await prisma.projectEntry.aggregate({
            where: {
                type: 'EXPENSE',
                project: { userId },
            },
            _sum: { amount: true },
        });

        const totalRevenue = Number(revenueEntries._sum.amount ?? 0);
        const totalExpenses = Number(expenseEntries._sum.amount ?? 0);

        return {
            totalProjects: projects.length,
            byStatus,
            billableProjects,
            totalBudget,
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
        };
    },

    /**
     * Get project categories
     */
    async getCategories(userId: string) {
        const projects = await prisma.project.findMany({
            where: { userId },
            select: { category: true },
            distinct: ['category'],
        });

        return projects
            .map((p: { category: string | null }) => p.category)
            .filter((c: string | null): c is string => c !== null)
            .sort();
    },
};
