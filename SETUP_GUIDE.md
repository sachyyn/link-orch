# LinkedinMaster Pro - Development Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **pnpm** (recommended package manager)
- **Git** with SSH keys configured
- **VS Code** (recommended IDE)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/linkedinmaster-pro.git
cd linkedinmaster-pro
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your actual values
code .env
```

### 4. Database Setup
```bash
# Generate initial migration
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database with sample data
pnpm db:seed
```

### 5. Start Development Server
```bash
pnpm dev
```

Your app will be available at `http://localhost:3000`

---

## 🔧 Detailed Setup Instructions

### Database Configuration (Neon PostgreSQL)

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Create a free account
   - Create a new project

2. **Get Connection String**
   - Navigate to your project dashboard
   - Go to "Connection Details"
   - Copy the connection string
   - Add to your `.env` file as `DATABASE_URL` and `DIRECT_URL`

3. **Test Connection**
   ```bash
   pnpm db:test-connection
   ```

### Authentication Setup (Clerk)

1. **Create Clerk Account**
   - Go to [clerk.com](https://clerk.com)
   - Create a free account
   - Create a new application

2. **Configure Application**
   - Set application name: "LinkedinMaster Pro"
   - Configure sign-in methods (email, social, etc.)
   - Set redirect URLs:
     - Sign-in redirect: `http://localhost:3000/dashboard`
     - Sign-up redirect: `http://localhost:3000/onboarding`

3. **Get API Keys**
   - Go to "API Keys" section
   - Copy publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy secret key → `CLERK_SECRET_KEY`

4. **Test Authentication**
   ```bash
   pnpm test:auth
   ```

### Caching Setup (Upstash Redis)

1. **Create Upstash Account**
   - Go to [upstash.com](https://upstash.com)
   - Create a free account
   - Create a Redis database

2. **Get Connection Details**
   - Copy REST URL → `UPSTASH_REDIS_REST_URL`
   - Copy REST Token → `UPSTASH_REDIS_REST_TOKEN`

3. **Test Redis Connection**
   ```bash
   pnpm test:redis
   ```

### File Storage Setup (Vercel Blob)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Create account and connect your GitHub

2. **Create Blob Storage**
   - In your Vercel dashboard, go to Storage
   - Create a new Blob store
   - Copy the read/write token → `BLOB_READ_WRITE_TOKEN`

---

## 📦 Package Scripts

### Development
```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
```

### Database Operations
```bash
pnpm db:generate  # Generate new migration
pnpm db:migrate   # Run pending migrations
pnpm db:reset     # Reset database (careful!)
pnpm db:seed      # Seed with sample data
pnpm db:studio    # Open Drizzle Studio
```

### Testing
```bash
pnpm test         # Run all tests
pnpm test:watch   # Run tests in watch mode
pnpm test:ui      # Run component tests
pnpm test:e2e     # Run end-to-end tests
pnpm test:coverage # Generate coverage report
```

---

## 🛠️ Development Tools Setup

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Git Hooks Setup
```bash
# Install husky for git hooks
pnpm husky install

# Pre-commit hook will run:
# - ESLint
# - Type checking
# - Tests
```

---

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
pnpm db:test-connection

# If migration fails, reset and try again
pnpm db:reset
pnpm db:migrate
```

#### Authentication Issues
```bash
# Verify Clerk keys are set
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# Check Clerk dashboard configuration
# Ensure redirect URLs match your local setup
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check for TypeScript errors
pnpm type-check
```

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### Getting Help

1. **Check the logs** - Development server logs often show the exact issue
2. **Verify environment variables** - Most issues are due to missing or incorrect env vars
3. **Check database connection** - Ensure your database is accessible
4. **Review the docs** - Each service (Clerk, Neon, Upstash) has excellent documentation

---

## 🚀 Production Deployment

### Vercel Deployment

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Add all production environment variables
   - Use different databases for staging/production

3. **Configure Build Settings**
   - Build command: `pnpm build`
   - Output directory: `.next`
   - Install command: `pnpm install`

4. **Setup Domain (Optional)**
   - Add custom domain in Vercel dashboard
   - Update `NEXT_PUBLIC_APP_URL` to your domain

### Environment-Specific Setup

#### Staging Environment
- Use separate database
- Use Clerk development keys
- Enable debug logging

#### Production Environment
- Use production database with backups
- Use Clerk production keys
- Enable security headers
- Setup monitoring and alerts

---

## 📚 Additional Resources

### Documentation Links
- [Next.js App Router](https://nextjs.org/docs/app)
- [Clerk Authentication](https://clerk.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Upstash Redis](https://upstash.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Learning Resources
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Database Design Patterns](https://orm.drizzle.team/docs/best-practices)

### Community
- [GitHub Discussions](https://github.com/your-repo/discussions)
- [Discord Server](https://discord.gg/your-server)
- [Twitter Updates](https://twitter.com/linkedinmaster)

---

## ✅ Setup Verification Checklist

Before starting development, verify:

- [ ] Node.js 18+ installed
- [ ] pnpm installed and working
- [ ] Git configured with SSH keys
- [ ] VS Code with recommended extensions
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Clerk authentication working
- [ ] Redis cache connection working
- [ ] Development server starts successfully
- [ ] Can sign in/sign up through Clerk
- [ ] Database migrations run successfully

Once all items are checked, you're ready to start development! 🎉

---

*Last updated: [Current Date]*
*For issues or questions, please check our [troubleshooting guide](./TROUBLESHOOTING.md) or create an issue.* 