import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth';
import routes from './routes/index';
import userRoutes from './routes/users.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();
app.set('trust proxy', true); // Trust standard proxy headers (X-Forwarded-Proto, etc.)
const PORT = Number(process.env.PORT) || 3001;

// CORS configuration - Allow multiple origins for local network access
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    // 'http://192.168.11.106:3000', // Covered by FRONTEND_URL if set correctly
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder', 'ngrok-skip-browser-warning', 'X-Org-ID'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));

// Parse JSON bodies with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Better Auth handler - must come before other routes
app.all('/api/auth/*', toNodeHandler(auth));

// API routes
app.use('/api', routes);
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server - bind to 0.0.0.0 to accept connections from local network
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📚 API available at http://localhost:${PORT}/api`);
    console.log(`🔐 Auth available at http://localhost:${PORT}/api/auth`);
});
