# MDKKUQUIZ

MDKKUQUIZ is the frontend for the MedQuiz application, built with Next.js, React, and TypeScript. It provides a modern, responsive interface for users to interact with quizzes, manage profiles, view statistics, and more.

---

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Docker Usage](#docker-usage)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Technologies Used](#technologies-used)

---

## Features
- User authentication (NextAuth.js, credentials provider)
- Quiz browsing, filtering, and participation
- Profile management and leaderboard
- Admin dashboard for managing quizzes, keywords, reports, and users
- Category, subject, and keyword navigation
- Responsive UI with Tailwind CSS and Material UI
- Image upload and gallery support
- Statistics and activity tracking

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API (see `/BackEnd`)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd MedQuiz/MDKKUQUIZ
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables)).
4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:3000` by default.

---

## Environment Variables
Create a `.env.local` file in the root directory. Common variables include:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-random-secret>
API_BASE_URL=http://localhost:5000/api/v1
```
Adjust these as needed for your backend and deployment.

---

## Available Scripts
- `npm run dev` — Start the development server (with Turbopack)
- `npm run build` — Build the app for production
- `npm run start` — Start the production server
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Fix lint errors
- `npm run lint:strict` — TypeScript strict check
- `npm run prettier:check` — Check code formatting
- `npm run prettier:clean` — Format code with Prettier

---

## Docker Usage
Build and run the frontend in a Docker container:
```bash
docker build -t mdkkuquiz-frontend .
docker run -p 3000:3000 --env-file .env.local mdkkuquiz-frontend
```

---

## Project Structure
```
MDKKUQUIZ/
├── src/
│   ├── app/           # Next.js app directory (routing, pages, API routes)
│   ├── components/    # Reusable UI components (Navbar, Profile, Quiz, etc.)
│   ├── hooks/         # Custom React hooks for data fetching and logic
│   ├── config/        # API routes, roles, and other config
│   ├── lib/           # Utility functions and libraries
│   ├── providers/     # Context and providers (NextAuth, Tanstack Query)
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility helpers
│   └── font/          # Custom fonts
├── public/            # Static assets (images, icons)
├── next.config.ts     # Next.js configuration
├── tsconfig.json      # TypeScript configuration
├── Dockerfile         # Docker configuration
└── ...
```

---

## Authentication
Authentication is handled via [NextAuth.js](https://next-auth.js.org/) using a credentials provider. The login page is at `/login`. Sessions are managed with JWT. See `src/app/api/auth/[...nextauth]/authOptions.ts` for details.

---

## Technologies Used
- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [React](https://react.dev/)
- [NextAuth.js](https://next-auth.js.org/) (authentication)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first styling)
- [Material UI](https://mui.com/) (UI components)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [TanStack Query](https://tanstack.com/query/latest) (data fetching)
- [Axios](https://axios-http.com/) (HTTP client)
- [TypeScript](https://www.typescriptlang.org/)

---

## License
ISC
