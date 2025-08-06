# FileSense.AI Backend

A robust Node.js/Express backend with Firebase integration for AI-powered file organization.

## 🚀 Features

- **Phone Authentication** with Firebase
- **File Upload & Processing** with multer
- **AI Integration** with OpenAI GPT-3.5
- **Firestore Database** with comprehensive models
- **Rate Limiting** and security middleware
- **TypeScript** for type safety
- **Comprehensive API** with proper validation

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Firebase & database configuration
│   ├── controllers/     # Request handlers (auth, files)
│   ├── middleware/      # Auth, security, validation
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   └── index.ts         # Server entry point
├── uploads/             # File storage directory
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🔧 Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

3. **Required Environment Variables**
   ```env
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
   
   # OpenAI
   OPENAI_API_KEY=sk-...
   
   # JWT
   JWT_SECRET=your-secret-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP to phone number
- `POST /api/v1/auth/verify-otp` - Verify OTP and sign in
- `POST /api/v1/auth/register` - Register/update user profile
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/logout` - Sign out user

### File Processing
- `POST /api/v1/files/upload` - Upload files for processing
- `POST /api/v1/files/process` - Start file processing
- `GET /api/v1/files/processing/:sessionId` - Get processing status
- `POST /api/v1/files/generate-filename` - Generate AI filename
- `GET /api/v1/files/my-files` - Get user's files
- `GET /api/v1/files/usage-stats` - Get usage statistics

### Health Check
- `GET /health` - Server health status
- `GET /api` - API documentation

## 🔐 Authentication Flow

1. **Send OTP**: Client requests OTP for phone number
2. **Verify OTP**: Client submits OTP code, receives Firebase token
3. **Register**: Client provides additional profile information
4. **Access**: Client uses Firebase ID token for authenticated requests

## 📄 File Processing Flow

1. **Upload**: Client uploads files (max 20 files, 50MB each)
2. **Process**: Server extracts text and generates AI filenames
3. **Track**: Client polls processing status endpoint
4. **Complete**: Server returns processed files with new names

## 🛡️ Security Features

- **Firebase Authentication** for secure user management
- **Rate limiting** (1000 requests/15min general, stricter for sensitive endpoints)
- **Input validation** with Joi schemas
- **File type validation** (only images and PDFs)
- **CORS** properly configured
- **Helmet.js** for security headers
- **Error handling** without information leakage

## 📊 Database Schema

### Users Collection
```typescript
{
  uid: string;
  phoneNumber: string;
  displayName?: string;
  email?: string;
  role: 'free' | 'premium' | 'admin';
  filesProcessedThisMonth: number;
  monthlyLimit: number;
  subscriptionStatus: 'active' | 'inactive';
  settings: {
    autoRename: boolean;
    preserveOriginalNames: boolean;
    useAIForAllFiles: boolean;
    maxFileSize: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Files Collection
```typescript
{
  id: string;
  userId: string;
  originalName: string;
  newName?: string;
  filePath: string;
  fileType: 'image' | 'pdf' | 'document';
  fileSize: number;
  extractedText?: string;
  suggestedName?: string;
  isProcessed: boolean;
  isRenamed: boolean;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X GET http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure proper Firebase service account
- Set up proper CORS origins
- Configure rate limiting for production load
- Set up monitoring and logging

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoring

The backend includes:
- **Health check endpoint** at `/health`
- **Request logging** with Morgan
- **Error logging** to console
- **Performance metrics** ready for integration

## 🔄 Integration Points

### OCR Services
Ready for integration with:
- Google ML Kit (on-device)
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision

### Payment Processing
Ready for integration with:
- Stripe
- RevenueCat
- Apple/Google Pay
- PayPal

### File Storage
Currently uses local storage, ready for:
- AWS S3
- Google Cloud Storage
- Firebase Cloud Storage
- Azure Blob Storage

## 🚨 Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "data": {} // Optional additional data
}
```

Common error codes:
- `TOKEN_MISSING` - No authorization token provided
- `TOKEN_EXPIRED` - Token has expired
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `FILE_TOO_LARGE` - File exceeds size limit
- `MONTHLY_LIMIT_EXCEEDED` - User exceeded monthly file limit

## 📚 API Documentation

Full API documentation is available at `/api` endpoint when the server is running.

For detailed examples and integration guides, see the main project documentation.

---

**Built with ❤️ for efficient file organization**