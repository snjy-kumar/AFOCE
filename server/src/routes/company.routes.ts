import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { companyService } from '../services/company.service.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { Response, NextFunction } from 'express';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/companies
 * @desc    Create a new company
 * @access  Private
 */
router.post('/', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const company = await companyService.createCompany(userId, req.body);
        res.status(201).json({ success: true, data: company, message: 'Company created successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/companies
 * @desc    Get all companies for current user
 * @access  Private
 */
router.get('/', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const companies = await companyService.getUserCompanies(userId);
        res.json({ success: true, data: companies });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/companies/default
 * @desc    Get user's default company
 * @access  Private
 */
router.get('/default', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const company = await companyService.getDefaultCompany(userId);
        res.json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/companies/:id
 * @desc    Get a single company by ID
 * @access  Private
 */
router.get('/:id', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const company = await companyService.getCompany(req.params.id, userId);
        if (!company) {
            res.status(404).json({ success: false, error: 'Company not found or access denied' });
            return;
        }
        res.json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/companies/:id
 * @desc    Update a company
 * @access  Private (OWNER or MANAGER)
 */
router.put('/:id', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const company = await companyService.updateCompany(req.params.id, userId, req.body);
        res.json({ success: true, data: company, message: 'Company updated successfully' });
    } catch (error) {
        if (error instanceof Error && error.message === 'Permission denied') {
            res.status(403).json({ success: false, error: error.message });
            return;
        }
        next(error);
    }
});

/**
 * @route   DELETE /api/companies/:id
 * @desc    Delete a company (soft delete)
 * @access  Private (OWNER only)
 */
router.delete('/:id', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        await companyService.deleteCompany(req.params.id, userId);
        res.json({ success: true, message: 'Company deleted successfully' });
    } catch (error) {
        if (error instanceof Error && error.message.includes('owner')) {
            res.status(403).json({ success: false, error: error.message });
            return;
        }
        next(error);
    }
});

/**
 * @route   POST /api/companies/:id/set-default
 * @desc    Set a company as user's default
 * @access  Private
 */
router.post('/:id/set-default', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        await companyService.setDefaultCompany(req.params.id, userId);
        res.json({ success: true, message: 'Default company updated' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/companies/:id/leave
 * @desc    Leave a company
 * @access  Private
 */
router.post('/:id/leave', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        await companyService.leaveCompany(req.params.id, userId);
        res.json({ success: true, message: 'Left company successfully' });
    } catch (error) {
        if (error instanceof Error && error.message.includes('owner')) {
            res.status(400).json({ success: false, error: error.message });
            return;
        }
        next(error);
    }
});

// ============================================
// MEMBER MANAGEMENT ROUTES
// ============================================

/**
 * @route   GET /api/companies/:id/members
 * @desc    Get all members of a company
 * @access  Private
 */
router.get('/:id/members', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const members = await companyService.getMembers(req.params.id, userId);
        res.json({ success: true, data: members });
    } catch (error) {
        if (error instanceof Error && error.message === 'Not a member of this company') {
            res.status(403).json({ success: false, error: error.message });
            return;
        }
        next(error);
    }
});

/**
 * @route   POST /api/companies/:id/members
 * @desc    Invite a member to the company
 * @access  Private (OWNER or MANAGER)
 */
router.post('/:id/members', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const { email, role } = req.body;

        if (!email || !role) {
            res.status(400).json({ success: false, error: 'Email and role are required' });
            return;
        }

        const member = await companyService.inviteMember(req.params.id, userId, { email, role });
        res.status(201).json({ success: true, data: member, message: 'Member added successfully' });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Permission denied' || error.message.includes('Only owners')) {
                res.status(403).json({ success: false, error: error.message });
                return;
            }
            if (error.message.includes('not found') || error.message.includes('already')) {
                res.status(400).json({ success: false, error: error.message });
                return;
            }
        }
        next(error);
    }
});

/**
 * @route   PUT /api/companies/:id/members/:memberId
 * @desc    Update a member's role
 * @access  Private (OWNER or MANAGER)
 */
router.put('/:id/members/:memberId', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const { role } = req.body;

        if (!role) {
            res.status(400).json({ success: false, error: 'Role is required' });
            return;
        }

        const member = await companyService.updateMemberRole(
            req.params.id,
            req.params.memberId,
            userId,
            role
        );
        res.json({ success: true, data: member, message: 'Member role updated' });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Permission denied' || error.message.includes('Only owners') || error.message.includes('Cannot demote')) {
                res.status(403).json({ success: false, error: error.message });
                return;
            }
            if (error.message === 'Member not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
        }
        next(error);
    }
});

/**
 * @route   DELETE /api/companies/:id/members/:memberId
 * @desc    Remove a member from the company
 * @access  Private (OWNER or MANAGER)
 */
router.delete('/:id/members/:memberId', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        await companyService.removeMember(req.params.id, req.params.memberId, userId);
        res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Permission denied' || error.message.includes('Only owners') || error.message.includes('Cannot remove')) {
                res.status(403).json({ success: false, error: error.message });
                return;
            }
            if (error.message === 'Member not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
        }
        next(error);
    }
});

export default router;
