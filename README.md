# VPM Frontend - Virtual Peace of Mind Dashboard

A modern React-based frontend application for managing student intake forms, dashboard analytics, and administrative functions for Virtual Peace of Mind (VPM).

## 🚀 Tech Stack

- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **React Hook Form + Zod** - Form validation
- **Highcharts** - Data visualization
- **Axios** - HTTP client
- **Sonner** - Toast notifications

## ✨ Features

### Public Features (No Login Required)
- **Intake Form** - Submit student intake forms with file uploads
- **Status Check** - Check intake form status using Student UUID

### Authenticated Features
- **Dashboard** - View aggregated data and analytics
- **Admin Portal** - Process intake forms (VPM Admin only)
- **User Profile** - Manage user profile information

### Key Capabilities
- Role-based access control (VPM Admin, District Admin, District Viewer)
- JWT authentication
- Responsive design (mobile, tablet, desktop)
- Real-time form validation
- File upload with camera support
- Data visualization with Highcharts
- Toast notifications
- Protected routes

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (default: `http://localhost:8000`)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VPMFrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file** (optional)
   ```bash
   # Create .env.local for local development
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── layout/         # Layout components (Header, SubHeader, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   ├── charts/         # Chart components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth, User)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API configuration
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   └── ...
├── services/           # API service layer
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
└── main.tsx            # Application entry point
```

## 🔐 Authentication

The application uses JWT-based authentication:
- Tokens are stored in `localStorage`
- Axios interceptors automatically add tokens to requests
- 401 responses trigger automatic logout and redirect to login

## 🎨 Design System

### Colors
- **Primary**: `#294a4a` (Dark teal)
- **Primary Hover**: `#375b59` (Lighter teal)
- **Background**: `#bae1d3` (Light mint green)
- **Brand Color**: `#bae1d3`

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scaling from 12px to 4xl

### Components
- All UI components follow shadcn/ui design patterns
- Consistent spacing using Tailwind's spacing scale
- Smooth animations and transitions

## 🔌 API Integration

### Public API Endpoints
- `POST /api/v1/intake/submit` - Submit intake form
- `GET /api/v1/intake/status/{uuid}` - Check intake status

### Authenticated API Endpoints
- All other endpoints require JWT authentication
- Token is automatically included in request headers

### API Configuration
- Development: `http://localhost:8000`
- Production: Configured via `VITE_API_BASE_URL` environment variable
- Public API instance (`publicApi.ts`) for non-authenticated endpoints
- Authenticated API instance (`api.ts`) for protected endpoints

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🧪 State Management

### Redux Toolkit
- Centralized state management
- Modular slices for different features
- Type-safe hooks (`useAppDispatch`, `useAppSelector`)

### Current Slices
- `intakeSlice` - Intake form state management

### React Context
- `AuthContext` - Authentication state
- `UserContext` - User profile state

## 🚦 Routing

### Public Routes
- `/intake` - Intake form
- `/intake/status` - Status check

### Auth Routes (Redirect if authenticated)
- `/login` - Login page
- `/signup` - Signup page
- `/verify-email` - Email verification
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset

### Protected Routes
- `/dashboard` - Main dashboard (all authenticated users)
- `/admin/intake/:id` - Intake processing (VPM Admin only)

## 🔒 Security Features

- JWT token management
- Protected routes
- Role-based access control
- Input validation with Zod
- XSS protection
- CSRF protection (via same-origin policy)

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

Output will be in the `dist/` directory.

### Environment Variables
- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:8000` in dev)
- `VITE_CSV_DATA_URL` - CSV data URL for charts (optional)

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Add proper error handling
4. Write descriptive commit messages
5. Test your changes before submitting

## 📝 License

Private project - All rights reserved

## 🆘 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for Virtual Peace of Mind**

