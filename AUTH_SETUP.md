# MotorTrust - Authentication Setup Guide

## Environment Variables

1. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Replace `http://localhost:8000` with your backend API URL.

## JWT-Based Authentication

The app uses JWT (JSON Web Token) authentication with your backend API.

### How it works:
1. User signs up or logs in with email/password
2. Backend returns a JWT token
3. Token is stored in browser localStorage
4. All subsequent API requests include the token in the Authorization header

## Backend API Integration

### Required Endpoints:

#### 1. **POST /api/auth/signup**
Register a new user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "consumer",
  "phone_number": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { /* user object */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. **POST /api/auth/login**
Login existing user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { /* user object */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. **GET /api/auth/me**
Get current user data (protected route).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { /* user object */ }
}
```

#### 4. **POST /api/auth/logout**
Logout user (optional backend cleanup).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Authentication Flow

1. **Signup:**
   - User fills signup form with email, password, name, and role
   - App calls `POST /api/auth/signup`
   - Backend returns user data + JWT token
   - Token is stored in localStorage
   - User is redirected to dashboard

2. **Login:**
   - User enters email and password
   - App calls `POST /api/auth/login`
   - Backend returns user data + JWT token
   - Token is stored in localStorage
   - User is redirected to dashboard

3. **Protected Routes:**
   - Dashboard checks if token exists in localStorage
   - If no token, redirect to signup page
   - If token exists, call `GET /api/auth/me` to verify and get user data
   - If token invalid, clear it and redirect to signup

4. **Logout:**
   - Call `POST /api/auth/logout` (optional)
   - Clear token from localStorage
   - Redirect to home page

## Supported User Roles

- **consumer** - Car owners
- **repair_shop** - Auto repair businesses (requires phone number)
- **insurance_company** - Insurance providers (requires phone + company ID)
- **carfax_service** - Vehicle history platforms (requires API key)

## Development

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment:**
```bash
# Create .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
```

3. **Run development server:**
```bash
npm run dev
```

4. **Test authentication:**
- Visit `http://localhost:3000`
- Click "Get Started" button
- Try signing up with a new account
- Try logging in with existing account
- Access dashboard and test logout

## File Structure

```
lib/
└── auth.ts              # JWT authentication service & token management

app/
├── signup/
│   └── page.tsx        # Signup/Login page
├── dashboard/
│   └── page.tsx        # Protected dashboard (requires auth)
└── components/         # Landing page components
```

## Token Storage

- Tokens are stored in browser's localStorage
- Key: `motortrust_token`
- Format: `Bearer <jwt_token>`
- Automatically included in all authenticated API requests

## Security Notes

- Always use HTTPS in production
- Tokens should have expiration time (handle on backend)
- Implement token refresh mechanism if needed
- Never expose API secrets in frontend code
- Validate all user inputs on backend


