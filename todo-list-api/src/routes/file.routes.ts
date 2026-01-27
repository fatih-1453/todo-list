import { Router, Response, Request } from 'express';
import { fileService } from '../services/file.service';
import { folderService } from '../services/folder.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();
router.use(authMiddleware);

// --- FOLDERS ---

// GET /api/files/folders
// GET /api/files/folders
router.get('/folders', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;
        // Use folderService
        const folders = await folderService.getAll(req.activeOrgId!, programId);
        res.json(folders);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});

// POST /api/files/folders
// POST /api/files/folders
router.post('/folders', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const folder = await folderService.create({
            name: req.body.name,
            orgId: req.activeOrgId!,
            createdById: req.user!.id,
            programId: req.body.programId ? parseInt(req.body.programId) : undefined
        });
        res.status(201).json(folder);
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// DELETE /api/files/folders/:id
// DELETE /api/files/folders/:id
router.delete('/folders/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await folderService.delete(id);
        res.json({ message: 'Folder deleted' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

// --- FILES ---

// GET /api/files
// GET /api/files
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
        const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;

        let files;
        if (programId) {
            files = await fileService.getFilesByProgramId(programId, folderId);
        } else {
            files = await fileService.getAllFiles(req.activeOrgId!, folderId);
        }
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// POST /api/files
router.post('/', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const fileReq = req as AuthenticatedRequest & { file?: Express.Multer.File };
        if (!fileReq.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = await fileService.createFile({
            name: fileReq.file.originalname, // Use original name
            size: (fileReq.file.size / (1024 * 1024)).toFixed(2) + " MB",
            type: fileReq.file.mimetype,
            path: `/uploads/${fileReq.file.filename}`, // Store relative path
            folderId: req.body.folderId && req.body.folderId !== 'undefined' ? parseInt(req.body.folderId as string) : null,
            programId: req.body.programId && req.body.programId !== 'undefined' ? parseInt(req.body.programId as string) : null,
            orgId: req.activeOrgId!,
            uploadedById: req.user!.id
        });
        res.status(201).json(file);
    } catch (error) {
        console.error('Error creating file record:', error);
        res.status(500).json({ error: 'Failed to upload file record' });
    }
});

// DELETE /api/files/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await fileService.deleteFile(id, req.activeOrgId!);
        res.json({ message: 'File deleted' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

export default router;
