import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth';

import { organizationService } from '../services/organization.service';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
    };
    session?: {
        id: string;
        userId: string;
    };
    activeOrgId?: string;
    isGlobalView?: boolean;
}

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as Record<string, string>,
        });

        if (!session) {
            console.log('[AuthMiddleware] No session found. Headers:', req.headers);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = session.user;
        req.session = session.session;

        // Resolve Organization
        const orgs = await organizationService.getUserOrganizations(session.user.id);

        // 1. Check Session for Active Org (Priority 1)
        if (session.session.activeOrganizationId) {
            const hasAccess = orgs.some(o => o.id === session.session.activeOrganizationId);
            if (hasAccess) {
                req.activeOrgId = session.session.activeOrganizationId!;
            }
        }

        // 2. Fallback to Header if not in session or session invalid (Priority 2)
        if (!req.activeOrgId && orgs.length > 0) {
            const orgIdHeader = req.headers['x-org-id'];
            if (orgIdHeader) {
                const requestedOrgId = orgIdHeader as string;
                const hasAccess = orgs.some(o => o.id === requestedOrgId);
                if (hasAccess) {
                    req.activeOrgId = requestedOrgId;
                } else {
                    console.log(`[AuthMiddleware] Access denied for org header: ${requestedOrgId}. User Orgs:`, orgs.map(o => o.id));
                    return res.status(403).json({ error: 'Access to organization denied' });
                }
            } else {
                console.log(`[Auth] Defaulting to first org: ${orgs[0].name} (${orgs[0].id})`);
                req.activeOrgId = orgs[0].id; // Ensure default is string (orgs[0].id is string)
            }
        } else if (!req.activeOrgId && orgs.length === 0) {
            // User has no organizations - allow request to proceed without activeOrgId
            req.activeOrgId = undefined;
        }

        // Check if active org is "Direksi" or "Admin Workspace" for Global View
        const activeOrg = orgs.find(o => o.id === req.activeOrgId);
        if (activeOrg && (activeOrg.name === 'Direksi' || activeOrg.slug === 'admin-workspace')) {
            req.isGlobalView = true;
        }


        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}
