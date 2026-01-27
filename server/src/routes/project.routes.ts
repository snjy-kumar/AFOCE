import { Router, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service.js';
import { authenticate } from '../middleware/auth.js';
import { ProjectStatus, ProjectEntryType } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/projects
 * @desc Get all projects with filters
 */
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const query = {
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
            search: req.query.search as string,
            status: req.query.status as ProjectStatus,
            customerId: req.query.customerId as string,
            category: req.query.category as string,
        };

        const result = await projectService.getProjects(req.user!.userId, query);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/projects/summary
 * @desc Get projects summary for dashboard
 */
router.get('/summary', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const summary = await projectService.getProjectsSummary(req.user!.userId);
        res.json(summary);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/projects/categories
 * @desc Get unique project categories
 */
router.get('/categories', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const categories = await projectService.getCategories(req.user!.userId);
        res.json({ categories });
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /api/projects
 * @desc Create a new project
 */
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.createProject(req.user!.userId, req.body);
        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/projects/:id
 * @desc Get single project with entries
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.getProject(req.user!.userId, req.params.id);
        res.json(project);
    } catch (error) {
        next(error);
    }
});

/**
 * @route PUT /api/projects/:id
 * @desc Update project
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.updateProject(req.user!.userId, req.params.id, req.body);
        res.json(project);
    } catch (error) {
        next(error);
    }
});

/**
 * @route DELETE /api/projects/:id
 * @desc Delete project
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await projectService.deleteProject(req.user!.userId, req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /api/projects/:id/entries
 * @desc Add entry to project
 */
router.post('/:id/entries', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const entry = await projectService.addEntry(req.user!.userId, req.params.id, {
            type: req.body.type as ProjectEntryType,
            description: req.body.description,
            notes: req.body.notes,
            amount: req.body.amount,
            hours: req.body.hours,
            date: req.body.date,
            invoiceId: req.body.invoiceId,
            expenseId: req.body.expenseId,
            isBillable: req.body.isBillable,
        });
        res.status(201).json(entry);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/projects/:id/entries
 * @desc Get project entries
 */
router.get('/:id/entries', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

        const result = await projectService.getEntries(req.user!.userId, req.params.id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route DELETE /api/projects/:id/entries/:entryId
 * @desc Delete project entry
 */
router.delete('/:id/entries/:entryId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await projectService.deleteEntry(
            req.user!.userId,
            req.params.id,
            req.params.entryId
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
