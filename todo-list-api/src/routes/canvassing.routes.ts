import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { canvassingService } from '../services/canvassing.service';
import multer from 'multer';
import fs from 'fs';
import * as XLSX from 'xlsx';

const router = Router();
router.use(authMiddleware);

// --- Big Data Routes ---

router.get('/big-data', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const results = await canvassingService.getAll(req.activeOrgId!, req.isGlobalView);
        res.json(results);
    } catch (error) {
        console.error('Error fetching big data:', error);
        res.status(500).json({ error: 'Failed to fetch big data' });
    }
});

router.post('/big-data', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const newItem = await canvassingService.createBigData({
            ...req.body,
            orgId: req.activeOrgId!
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating big data:', error);
        res.status(500).json({ error: 'Failed to create big data' });
    }
});

router.put('/big-data/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const updated = await canvassingService.updateBigData(id, req.activeOrgId!, req.body);
        res.json(updated);
    } catch (error) {
        console.error('Error updating big data:', error);
        res.status(500).json({ error: 'Failed to update big data' });
    }
});

router.delete('/big-data/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await canvassingService.deleteBigData(id, req.activeOrgId!);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting big data:', error);
        res.status(500).json({ error: 'Failed to delete big data' });
    }
});

// Mock Upload for Big Data
const storage = multer.diskStorage({
    destination: 'uploads/big-data',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/big-data/upload', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        // Here we would parse CSV/Excel and insert into DB.
        // For prototype, we just return success.
        res.json({ message: 'File uploaded successfully', filename: req.file.filename });
    } catch (error) {
        console.error('Error uploading big data:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});


// --- Target Routes ---

router.get('/targets', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
        const search = req.query.search as string | undefined;
        const type = req.query.type as string | undefined;

        const items = await canvassingService.getAllTargets(req.activeOrgId!, startDate, endDate, search, type, req.isGlobalView);
        res.json(items);
    } catch (error) {
        console.error('Error fetching targets:', error);
        res.status(500).json({ error: 'Failed to fetch targets' });
    }
});

router.post('/targets', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const newItem = await canvassingService.createTarget({
            ...req.body,
            orgId: req.activeOrgId!
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating target:', error);
        res.status(500).json({ error: 'Failed to create target' });
    }
});

router.put('/targets/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const updated = await canvassingService.updateTarget(id, req.activeOrgId!, req.body);
        res.json(updated);
    } catch (error) {
        console.error('Error updating target:', error);
        res.status(500).json({ error: 'Failed to update target' });
    }
});

router.delete('/targets/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await canvassingService.deleteTarget(id, req.activeOrgId!);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting target:', error);
        res.status(500).json({ error: 'Failed to delete target' });
    }
});

// Target Upload


router.post('/targets/upload', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Assuming first sheet
        const sheet = workbook.Sheets[sheetName];

        // Parse as array of arrays
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        // Expected Header: ['Target 2026', 'Jan', 'Feb', ... 'Total']
        // Data starts at row 1 (index 1)

        let createdCount = 0;

        // Try to parse year from header, e.g. "Target 2027"
        let currentYear = new Date().getFullYear();
        if (jsonData.length > 0 && jsonData[0].length > 0) {
            const headerCell = jsonData[0][0]; // "Target 2026"
            if (typeof headerCell === 'string') {
                const match = headerCell.match(/Target\s+(\d{4})/i);
                if (match && match[1]) {
                    currentYear = parseInt(match[1]);
                }
            }
        }

        const targetsToCreate = [];

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const category = row[0]; // "Perusahaan", "Target Masjid", etc.
            if (!category) continue;

            // Iterate Months (Columns 1 to 12)
            for (let month = 0; month < 12; month++) {
                const colIndex = month + 1;
                const value = row[colIndex];

                if (value && typeof value === 'number' && value > 0) {
                    // Create Date Range
                    const startDate = new Date(currentYear, month, 1);
                    const endDate = new Date(currentYear, month + 1, 0); // Last day of month

                    targetsToCreate.push({
                        orgId: req.activeOrgId!,
                        title: category,
                        type: category, // Use category as type for now
                        targetAmount: value.toString(),
                        startDate: startDate,
                        endDate: endDate,
                        status: 'Active'
                    });
                }
            }
        }

        if (targetsToCreate.length > 0) {
            const created = await canvassingService.createTargetsBulk(targetsToCreate);
            createdCount = created.length;
        }

        // Clean up file
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) { console.error("Failed to delete temp file", e); }

        res.json({ message: `Successfully imported ${createdCount} targets`, count: createdCount });

    } catch (error) {
        console.error('Error uploading targets:', error);
        res.status(500).json({ error: 'Failed to upload and parse targets' });
    }
});

export default router;
