import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import path from "path";
import connectDB from './config/data';
import EmailService from './utils/emailService';
// Import routes
import paymentRoutes from './routes/payment';
import downloadRoutes from './routes/download';

// EventEmitter konfiguracija
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 20;

// Load environment variables
dotenv.config();

// Inicijalizacija
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// TEST ENDPOINT za slanje emaila sa URL attachment
app.post('/test/email', async (req, res) => {
  try {
    const { email, fileUrl } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email je obavezan' });
    }
    
    // Koristi default test URL ako nije dat
    const testUrl = fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    
    console.log('\n🧪 === TEST EMAIL ENDPOINT ===');
    console.log('📧 Test email:', email);
    console.log('📎 Test URL:', testUrl);
    
    await EmailService.sendTestEmail(email, testUrl);
    
    res.json({ 
      success: true, 
      message: 'Test email poslat!',
      email: email,
      testUrl: testUrl
    });
    
  } catch (error) {
    console.error('Test email greška:', error);
    res.status(500).json({ 
      error: 'Greška pri slanju test emaila: '  
    });
  }
});
// Serve static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/payment', paymentRoutes);
app.use('/api/download', downloadRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server function
const startServer = async (): Promise<void> => {
  try {
    // Debug environment variables
    console.log('🔍 Environment Debug:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
    
    // Connect to database first
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`
🚀 Server is running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📱 Local: http://localhost:${PORT}
🗄️  Database: Connected to MongoDB
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Start the application
startServer().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});