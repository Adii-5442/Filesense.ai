# 🧠 FileSense.AI

[![React Native](https://img.shields.io/badge/React%20Native-0.80.2-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin%20SDK-orange.svg)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**AI-powered file organization made simple.** Transform your messy file names into intelligent, searchable ones with the power of artificial intelligence.

## 📱 Overview

FileSense.AI is a comprehensive mobile application that leverages AI to automatically organize and rename files based on their content. Using advanced OCR technology and OpenAI's GPT models, it extracts text from images and documents, then generates meaningful filenames that make your files instantly searchable and organized.

### 🎯 Key Features

- **🤖 AI-Powered Renaming**: Smart filename suggestions based on content analysis
- **📱 Cross-Platform**: Native iOS and Android support  
- **🔒 Secure Authentication**: Phone number verification with Firebase
- **👤 Guest Mode**: Process up to 5 files without registration
- **📄 Multi-Format Support**: Images (JPG, PNG), PDFs, and documents
- **⚡ Real-Time Processing**: Live progress tracking and status updates
- **☁️ Cloud Sync**: Access your organized files across devices
- **📊 Usage Analytics**: Track your productivity improvements

## 🏗️ Architecture Overview

FileSense.AI follows a modern, scalable architecture with clear separation between frontend and backend services.

```mermaid
graph TB
    subgraph "Mobile App (React Native)"
        A[Authentication Screens] --> B[File Selection]
        B --> C[Processing Interface] 
        C --> D[Results & Management]
        D --> E[Settings & Profile]
    end
    
    subgraph "Backend Services (Node.js + Express)"
        F[Auth Controller] --> G[File Controller]
        G --> H[AI Processing Service]
        H --> I[Database Service]
    end
    
    subgraph "External Services"
        J[Firebase Auth]
        K[Firestore Database]
        L[OpenAI GPT-3.5]
        M[Google ML Kit OCR]
    end
    
    A --> F
    B --> G
    C --> H
    F --> J
    I --> K
    H --> L
    H --> M
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style J fill:#fff3e0
```

## 🔄 User Flow Diagram

### Complete User Journey

```mermaid
flowchart TD
    Start([User Opens App]) --> Auth{Authenticated?}
    
    Auth -->|No| Guest[Continue as Guest]
    Auth -->|No| SignUp[Sign Up with Phone]
    Auth -->|Yes| Home[Home Dashboard]
    
    Guest --> GuestLimit[5 File Limit]
    SignUp --> OTP[Enter OTP Code]
    OTP --> Profile[Setup Profile]
    Profile --> Home
    
    Home --> Select[Select Files]
    GuestLimit --> Select
    
    Select --> Upload[Upload Files]
    Upload --> Process[AI Processing]
    
    Process --> Extract[Extract Text]
    Extract --> Generate[Generate Filenames]
    Generate --> Results[Show Results]
    
    Results --> Apply[Apply Changes]
    Results --> Undo[Undo Changes]
    Apply --> Success[✅ Files Organized]
    Undo --> Results
    
    Success --> More{Process More?}
    More -->|Yes| Select
    More -->|No| Home
    
    style Start fill:#4caf50
    style Success fill:#2e7d32
    style Guest fill:#ff9800
    style SignUp fill:#2196f3
```

## 📋 Sequence Diagrams

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Mobile App
    participant FB as Firebase Auth
    participant BE as Backend API
    participant DB as Firestore
    
    U->>App: Enter phone number
    App->>FB: Send OTP request
    FB-->>App: OTP sent confirmation
    App-->>U: "Check your messages"
    
    U->>App: Enter OTP code
    App->>FB: Verify OTP
    FB-->>App: Firebase ID Token
    
    App->>BE: Register user with token
    BE->>FB: Verify ID token
    FB-->>BE: Token valid + user data
    BE->>DB: Create/update user record
    DB-->>BE: User saved
    BE-->>App: User profile data
    App-->>U: Welcome to FileSense.AI
```

### File Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Mobile App
    participant BE as Backend API
    participant OCR as OCR Service
    participant AI as OpenAI API
    participant DB as Database
    
    U->>App: Select files to process
    App->>BE: Upload files
    BE->>DB: Store file metadata
    BE-->>App: Upload confirmation + session ID
    
    App->>BE: Start processing
    BE->>OCR: Extract text from files
    OCR-->>BE: Extracted text content
    
    BE->>AI: Generate filename suggestions
    AI-->>BE: AI-generated filenames
    
    BE->>DB: Update processing results
    BE-->>App: Processing complete
    
    App->>U: Show renamed files
    U->>App: Apply/reject changes
    App->>BE: Confirm file operations
    BE->>DB: Update file records
    BE-->>App: Changes saved
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **React Native CLI** or **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Firebase Project** with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/filesenseAI.git
   cd filesenseAI
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install --legacy-peer-deps
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Configure Firebase**
   ```bash
   # Add your Firebase configuration files
   # Android: android/app/google-services.json
   # iOS: ios/filesenseAI/GoogleService-Info.plist
   ```

4. **Setup environment variables**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your Firebase and OpenAI credentials
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start backend server
   cd backend
   npm run dev
   
   # Terminal 2: Start React Native
   cd ..
   npm run android  # or npm run ios
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com

# OpenAI Configuration  
OPENAI_API_KEY=sk-...

# Security
JWT_SECRET=your-super-secret-jwt-key
```

### Firebase Configuration

1. **Enable Authentication**
   - Go to Firebase Console → Authentication
   - Enable Phone Number sign-in method
   - Configure your app's SHA certificates (Android)

2. **Setup Firestore**
   - Create a new Firestore database
   - Configure security rules

3. **Generate Service Account**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Add credentials to your `.env` file

## 📊 API Documentation

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/send-otp` | POST | Send OTP to phone number |
| `/api/v1/auth/verify-otp` | POST | Verify OTP and sign in |
| `/api/v1/auth/register` | POST | Register/update user profile |
| `/api/v1/auth/me` | GET | Get current user profile |
| `/api/v1/auth/logout` | POST | Sign out user |

### File Processing Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/files/upload` | POST | Upload files for processing |
| `/api/v1/files/process` | POST | Start AI processing |
| `/api/v1/files/processing/:id` | GET | Get processing status |
| `/api/v1/files/generate-filename` | POST | Generate AI filename |
| `/api/v1/files/my-files` | GET | Get user's files |

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests  
cd backend
npm test
```

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
npm run build
npm start
```

### Mobile App Deployment

#### Android

```bash
cd android
./gradlew assembleRelease
```

#### iOS

```bash
# Open in Xcode
open ios/filesenseAI.xcworkspace
```

## 📈 Performance

- **File Upload**: < 2s for 10MB files
- **Text Extraction**: < 3s per image
- **AI Processing**: < 5s per filename generation
- **Cold Start**: < 1s app launch time

## 🔒 Security

- **End-to-End Encryption**: All file transfers are encrypted
- **Firebase Auth**: Industry-standard authentication
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation

## 🛠️ Tech Stack

### Frontend
- **React Native** 0.80.2
- **TypeScript** 5.0.4
- **React Navigation** 6.x
- **Firebase SDK**
- **AsyncStorage**

### Backend
- **Node.js** 18+
- **Express.js** 4.x
- **TypeScript** 5.x
- **Firebase Admin SDK**
- **OpenAI API**

### Database & Services
- **Firestore** - NoSQL database
- **Firebase Auth** - Authentication
- **OpenAI GPT-3.5** - AI processing
- **Google ML Kit** - OCR

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/filesenseAI/issues)
- **Documentation**: See `/docs` folder
- **Email**: support@filesense.ai

---

<div align="center">

**Built with ❤️ for efficient file organization**

</div>