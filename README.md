# LinkedInMaster Pro 🚀

**AI-Powered LinkedIn Content Creation & Management Platform**

LinkedInMaster Pro is a comprehensive Next.js application that revolutionizes LinkedIn content strategy through advanced AI-powered content generation, analytics, and engagement management. Create compelling LinkedIn posts, articles, and carousels with intelligent AI assistance while tracking performance and managing your professional network.

## ✨ Key Features

### 🤖 **AI Content Creator** (Core Feature)
- **Intelligent Project Management**: Create content projects with customizable tones, guidelines, and target audiences
- **Multi-Format Generation**: Generate text posts, articles, polls, and carousel content
- **Advanced AI Models**: Powered by Google's Gemini 2.0 Flash and other cutting-edge models
- **Smart Content Sessions**: Ideation to publication workflow with context-aware generation
- **Custom Guidelines**: Define brand voice, content pillars, and audience-specific messaging
- **Tone Variations**: Professional, casual, thought-leader, provocative, educational, inspirational, and conversational styles

### 📊 **Analytics & Insights**
- Performance tracking and engagement metrics
- Content optimization recommendations
- Audience growth analysis

### 🎯 **Engagement Management**
- Lead tracking and relationship management
- Event coordination and networking tools
- Content scheduling and publishing workflow

### 🛠 **Developer-Friendly Architecture**
- Built with Next.js 15 and React 19
- TypeScript for type safety
- Drizzle ORM with Neon PostgreSQL
- Clerk authentication
- TanStack Query for data management
- Tailwind CSS with Radix UI components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)
- Clerk account for authentication
- Google AI API key for content generation

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd linkedinmaster-pro
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Database
   DATABASE_URL="your-neon-postgres-url"
   
   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   
   # AI Services
   GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"
   
   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate database schema
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # Optional: Open database studio
   pnpm db:studio
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🤖 AI Content Creation Workflow

### 1. Create an AI Project

```typescript
// Example project configuration
const projectConfig = {
  name: "Tech Thought Leadership",
  description: "AI and software development insights",
  tone: "thought-leader",
  contentType: "post",
  guidelines: `
    - Focus on practical AI applications in software development
    - Include personal experiences and lessons learned
    - Maintain professional yet approachable tone
    - Always provide actionable insights
  `,
  targetAudience: "Software developers and tech leaders",
  keyTopics: "AI, Machine Learning, Software Architecture, Leadership"
}
```

### 2. Generate Content Sessions

```typescript
// Create a content session
const sessionConfig = {
  postIdea: "The impact of AI pair programming on developer productivity",
  additionalContext: "Based on 6 months of using AI coding assistants",
  targetContentType: "text-post",
  selectedModel: "gemini-2.0-flash-exp",
  needsAsset: false
}
```

### 3. AI-Generated Output Examples

**Professional Tone Post:**
```
🚀 After 6 months of AI pair programming, here's what I've learned about developer productivity:

✅ 40% faster code completion
✅ Fewer syntax errors and bugs  
✅ More time for architectural thinking
✅ Better documentation habits

But here's the surprising part: The biggest gain wasn't speed—it was confidence to tackle unfamiliar codebases.

AI doesn't replace thinking. It amplifies it.

What's your experience with AI coding tools? 👇

#AI #SoftwareDevelopment #Productivity #TechLeadership
```

## 🏗 Architecture Overview

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **AI Integration**: Google AI SDK, Vercel AI SDK
- **State Management**: Zustand, TanStack Query
- **Forms**: React Hook Form with Zod validation

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (secured)/         # Protected routes
│   │   ├── ai-creator/    # 🤖 AI content creation
│   │   ├── analytics/     # 📊 Performance tracking
│   │   ├── engagement/    # 🎯 Lead management
│   │   └── dashboard/     # 📈 Overview
│   └── api/               # API routes
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── schemas/           # Zod validation schemas
│   └── validations.ts     # Form validations
├── services/              # External service integrations
└── types/                 # TypeScript type definitions
```

### Key Components

**AI Creator Hook (`use-ai-creator.ts`)**
```typescript
// Manages AI project and session state
export const useProjects = () => useQuery({
  queryKey: ['ai-creator', 'projects'],
  queryFn: fetchProjects
})

export const useCreateProject = () => useMutation({
  mutationFn: createProject,
  onSuccess: () => queryClient.invalidateQueries(['ai-creator'])
})
```

**Content Generation API (`/api/ai-creator/generate/content/route.ts`)**
```typescript
// Handles AI content generation with context awareness
export async function POST(request: Request) {
  const { projectId, sessionId, prompt } = await request.json()
  
  // Generate content using project guidelines and session context
  const content = await generateWithAI({
    model: 'gemini-2.0-flash-exp',
    prompt: buildContextualPrompt(project, session, prompt)
  })
  
  return Response.json({ content })
}
```

## 🎯 Usage Examples

### Creating Your First AI Project

1. **Navigate to AI Creator** (`/ai-creator`)
2. **Click "Create Project"**
3. **Configure your project:**
   - Name: "Personal Brand Content"
   - Tone: "Professional"
   - Content Type: "Post"
   - Guidelines: Your brand voice and messaging rules

### Generating Content

1. **Select your project**
2. **Create a new session** with your post idea
3. **Let AI generate** multiple variations
4. **Refine and customize** the output
5. **Export or schedule** your content

### Advanced Features

- **Custom Prompts**: Override default generation with specific instructions
- **Content Pillars**: Define topic categories for consistent messaging
- **Brand Voice**: Maintain consistent tone across all content
- **Multi-format**: Generate posts, articles, polls, and carousels from one idea

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db:generate      # Generate Drizzle schema
pnpm db:migrate       # Run database migrations  
pnpm db:studio        # Open Drizzle Studio
pnpm db:drop          # Drop database (use with caution)
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application URL | ✅ |

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Roadmap

### Upcoming Features
- [ ] **Multi-language Content Generation**
- [ ] **Advanced Analytics Dashboard**
- [ ] **Content Calendar Integration**
- [ ] **Team Collaboration Tools**
- [ ] **LinkedIn API Integration**
- [ ] **Content Performance Optimization**
- [ ] **Custom AI Model Training**

### AI Enhancements
- [ ] **Image Generation for Posts**
- [ ] **Video Script Creation**
- [ ] **Hashtag Optimization**
- [ ] **Engagement Prediction**
- [ ] **Content A/B Testing**

## 🤝 Support

- **Documentation**: [Coming Soon]
- **Issues**: [GitHub Issues](your-repo-issues-url)
- **Discussions**: [GitHub Discussions](your-repo-discussions-url)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for LinkedIn creators who want to leverage AI for authentic, engaging content.**
