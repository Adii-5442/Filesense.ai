# FileSense.AI Frontend

A beautiful and intuitive React Native mobile app for AI-powered file organization. Extract text from images and documents, then let AI suggest better filenames automatically.

## 🚀 Features

- **AI-Powered Renaming**: Smart filename suggestions based on content analysis
- **On-Device OCR**: Extract text from images without cloud dependency  
- **PDF Support**: Process and organize PDF documents intelligently
- **Batch Processing**: Organize multiple files simultaneously
- **Beautiful UI**: Modern, intuitive interface following design best practices
- **Cross-Platform**: Built with React Native for iOS and Android

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ActionButton.tsx # Beautiful button component with variants
│   ├── FileCard.tsx     # File display with progress and suggestions
│   ├── Header.tsx       # Consistent header component
│   ├── ProcessingIndicator.tsx # Animated processing status
│   └── index.ts         # Component exports
├── screens/             # Main app screens
│   ├── HomeScreen.tsx   # Dashboard with features and stats
│   ├── FileSelectorScreen.tsx # File picking and selection
│   ├── ProcessingScreen.tsx # Real-time processing status
│   ├── ResultsScreen.tsx # Results with undo functionality
│   ├── SettingsScreen.tsx # App configuration
│   └── index.ts         # Screen exports
├── navigation/          # Navigation setup
│   └── AppNavigator.tsx # Stack navigation configuration
├── services/            # Backend integration layer
│   ├── fileService.ts   # File operations and API calls
│   └── index.ts         # Service exports
├── hooks/               # Custom React hooks
│   ├── useFileProcessing.ts # File processing state management
│   └── index.ts         # Hook exports
├── types/               # TypeScript type definitions
│   └── index.ts         # All app types
├── constants/           # App constants and configuration
│   ├── theme.ts         # Design system (colors, typography, spacing)
│   └── index.ts         # App constants and API endpoints
└── utils/               # Utility functions (for future use)
```

## 🎨 Design System

The app follows a comprehensive design system with:

- **Colors**: Primary, secondary, surface, and semantic colors
- **Typography**: Consistent text styles and hierarchies  
- **Spacing**: Standardized padding and margins
- **Shadows**: Elevation and depth effects
- **Border Radius**: Consistent rounded corners

## 🔧 Backend Integration

The frontend is structured to make backend integration seamless:

### File Service Interface

```typescript
interface FileServiceInterface {
  // File system operations
  pickFilesFromGallery(): Promise<FileItem[]>;
  pickFilesFromDocuments(): Promise<FileItem[]>;
  scanDocumentWithCamera(): Promise<FileItem>;
  
  // Text extraction
  extractTextFromImage(file: FileItem): Promise<string>;
  extractTextFromPDF(file: FileItem): Promise<string>;
  
  // AI services  
  generateFilename(extractedText: string, originalFilename: string): Promise<string>;
  
  // File operations
  renameFile(file: FileItem, newName: string): Promise<boolean>;
  batchRenameFiles(files: FileItem[]): Promise<FileItem[]>;
}
```

### API Endpoints (for backend team)

```typescript
const API_ENDPOINTS = {
  extractText: '/api/extract-text',
  generateFilename: '/api/generate-filename', 
  processFiles: '/api/process-files',
  userSettings: '/api/user/settings',
  subscription: '/api/subscription',
};
```

## 🔌 Required Dependencies Implementation

The backend team needs to implement:

1. **File System Access**
   - `react-native-image-picker` - Gallery access
   - `react-native-document-picker` - Document picker
   - `expo-file-system` or `react-native-fs` - File operations

2. **OCR and Text Extraction**
   - `@react-native-google-ml-kit/vision` - On-device OCR
   - `react-native-pdf` - PDF text extraction

3. **AI Integration**
   - OpenAI GPT-3.5 Turbo API integration
   - Prompt engineering for filename generation

## 📱 Screen Flow

1. **Home Screen**: Dashboard with usage stats and quick actions
2. **File Selector**: Pick files from gallery, documents, or camera
3. **Processing Screen**: Real-time progress with file-by-file updates
4. **Results Screen**: Review renamed files with undo functionality  
5. **Settings Screen**: Configure AI settings and API keys

## 🎯 Key Components

### ActionButton
Beautiful button component with multiple variants:
- Primary, secondary, outline styles
- Small, medium, large sizes
- Loading states and icons

### FileCard  
Displays file information with:
- File type icons and metadata
- Processing progress indicators
- AI suggestions and extracted text
- Selection states

### ProcessingIndicator
Animated status component showing:
- Current processing stage
- Progress percentage
- File being processed
- Error states

## 💾 State Management

Uses React hooks for state management:
- `useFileProcessing` - Handles file processing workflow
- Local state in components for UI interactions
- Service layer for data persistence (to be implemented)

## 🔧 Configuration

### Theme Customization
Edit `src/constants/theme.ts` to customize:
- Brand colors
- Typography scales  
- Spacing system
- Shadow styles

### App Configuration
Edit `src/constants/index.ts` for:
- API endpoints
- File size limits
- Supported file types
- App metadata

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   # iOS
   npm run ios
   
   # Android  
   npm run android
   ```

3. **Backend Integration**
   - Implement the `FileServiceInterface` methods
   - Add your OpenAI API key to settings
   - Configure file system permissions

## 📋 TODO for Backend Team

- [ ] Implement file picker functionality
- [ ] Add camera scanner integration
- [ ] Set up Google ML Kit for OCR
- [ ] Integrate PDF text extraction
- [ ] Connect OpenAI API for filename generation
- [ ] Implement file renaming operations
- [ ] Add user settings persistence
- [ ] Set up subscription/billing (optional)

## 🎯 Best Practices

- **Component Organization**: Each component has a single responsibility
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Error Handling**: Graceful degradation and user feedback
- **Performance**: Optimized rendering and memory usage
- **Accessibility**: WCAG compliant components (to be enhanced)
- **Testing**: Component and integration tests (to be added)

## 📈 Future Enhancements

- [ ] Dark mode support
- [ ] Cloud sync functionality  
- [ ] Batch operations optimization
- [ ] Advanced AI settings
- [ ] File organization suggestions
- [ ] Integration with cloud storage providers

---

**Built with ❤️ for efficient file organization**

For questions or support, please refer to the component documentation or contact the development team.