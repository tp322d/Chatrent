# MultiModel Chat

A lightweight web application that allows users to compare responses from multiple AI models (OpenAI, Anthropic, Google) side by side with a single prompt.

## Features

- **Multi-Model Comparison**: Send one prompt to multiple AI models simultaneously
- **Side-by-Side Results**: Compare responses with performance metrics
- **User Authentication**: Secure JWT-based authentication
- **API Key Management**: Secure storage of user API keys
- **Chat History**: View and manage previous comparisons
- **Responsive Design**: Works on desktop and mobile devices

## Supported Models

### OpenAI
- GPT-4o, GPT-4o-mini
- GPT-4 Turbo, GPT-3.5 Turbo
- o1-preview, o1-mini

### Anthropic
- Claude 3.5 Sonnet, Claude 3.5 Haiku
- Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku

### Google
- Gemini Pro, Gemini Pro Vision
- Gemini 1.5 Pro, Gemini 1.5 Flash

## Quick Start

### Prerequisites

- Node.js 16+ 
- MongoDB (local or cloud)
- API keys from OpenAI, Anthropic, and/or Google

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multimodel-chat
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/multimodel-chat
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This starts both backend (port 3001) and frontend (port 5173).

### API Keys Configuration

1. Create an account and log in
2. Go to Settings → API Keys
3. Add your API keys for the providers you want to use:
   - **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Anthropic**: Get from [Anthropic Console](https://console.anthropic.com/)
   - **Google**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Usage

1. **Configure API Keys**: Add your API keys in the settings page
2. **Select Models**: Choose which models to compare in the chat interface
3. **Enter Prompt**: Type your question or prompt
4. **Compare Results**: View responses side-by-side with performance metrics
5. **Review History**: Access previous comparisons in the history page

## Architecture

### Backend (`/server`)
- **Express.js**: Web framework
- **MongoDB/Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **AI SDKs**: OpenAI, Anthropic, Google APIs

### Frontend (`/client`)
- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Axios**: HTTP client

### Key Components

- **AIService**: Handles multi-model API requests
- **AuthContext**: Manages authentication state
- **Chat Interface**: Side-by-side comparison view
- **Settings**: API key and profile management
- **History**: Previous chat management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/api-keys` - Update API keys

### Chat
- `POST /api/chat/compare` - Multi-model comparison
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/:id` - Get specific chat
- `DELETE /api/chat/:id` - Delete chat
- `GET /api/chat/models/available` - Get available models

## Development

### Project Structure
```
multimodel-chat/
├── server/                 # Backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth, error handling
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── services/         # AI service logic
├── client/               # Frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── styles/      # CSS files
└── README.md
```

### Available Scripts

```bash
npm run dev              # Start both frontend and backend
npm run server:dev       # Start backend only
npm run client:dev       # Start frontend only (cd client first)
npm start               # Production server
npm run build           # Build for production
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- API key encryption before storage
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue on GitHub or contact the maintainers.