import { createPostHandler } from '@/lib/api-wrapper'
import { db } from '@/db'
import { contentPosts, contentPillars } from '@/db/schema'
import { z } from 'zod'

export const POST = createPostHandler<any, any>(
  async ({ userId }) => {
    console.log(`🌱 Seeding database for user: ${userId}`)
    
    try {
      // Create sample content pillars
      const pillars = await db
        .insert(contentPillars)
        .values([
          {
            userId,
            name: 'Thought Leadership',
            description: 'Industry insights and strategic thinking',
            color: '#3B82F6',
            sortOrder: 1,
            isActive: true,
          },
          {
            userId,
            name: 'Company Culture',
            description: 'Behind-the-scenes and team highlights',
            color: '#10B981',
            sortOrder: 2,
            isActive: true,
          },
          {
            userId,
            name: 'Educational Content',
            description: 'Tips, tutorials, and how-to guides',
            color: '#F59E0B',
            sortOrder: 3,
            isActive: true,
          },
          {
            userId,
            name: 'Personal Stories',
            description: 'Personal experiences and lessons learned',
            color: '#8B5CF6',
            sortOrder: 4,
            isActive: true,
          },
        ])
        .returning()

      // Create sample posts
      const posts = await db
        .insert(contentPosts)
        .values([
          {
            userId,
            pillarId: pillars[0].id,
            title: 'The Future of AI in Business',
            content: 'As we move into 2024, artificial intelligence continues to reshape how we do business. Here are 5 key trends every leader should watch:\n\n1. AI-powered decision making\n2. Automated customer service\n3. Predictive analytics\n4. Smart workflow optimization\n5. Enhanced data security\n\nWhat trends are you seeing in your industry? 🤔',
            status: 'published',
            publishedAt: new Date('2024-01-15T10:00:00Z'),
            hashtags: ['AI', 'Business', 'Innovation', 'Technology', 'Leadership'],
            mentions: [],
            mediaUrls: [],
            likeCount: 45,
            commentCount: 12,
            shareCount: 8,
            impressionCount: 1250,
          },
          {
            userId,
            pillarId: pillars[1].id,
            title: 'Team Friday Wins',
            content: 'Celebrating our amazing team this Friday! 🎉\n\n✨ Sarah launched our new product feature\n✨ Mike closed 3 major deals this week\n✨ Lisa published her first industry article\n✨ Team collaboration reached new heights\n\nProud to work with such talented people! What wins are you celebrating this week?',
            status: 'published',
            publishedAt: new Date('2024-01-12T16:30:00Z'),
            hashtags: ['TeamWork', 'Wins', 'Culture', 'Celebration'],
            mentions: [],
            mediaUrls: [],
            likeCount: 67,
            commentCount: 18,
            shareCount: 12,
            impressionCount: 890,
          },
          {
            userId,
            pillarId: pillars[2].id,
            title: 'How to Write Better LinkedIn Posts',
            content: 'Want to improve your LinkedIn content? Here\'s my simple framework:\n\n📝 Hook: Start with a question or bold statement\n💡 Value: Share 3-5 actionable insights\n🤝 Connection: Ask for engagement\n📊 Format: Use bullet points and emojis\n\nBonus tip: Share a personal story to make it relatable!\n\nWhat\'s your go-to content structure?',
            status: 'published',
            publishedAt: new Date('2024-01-10T09:15:00Z'),
            hashtags: ['LinkedInTips', 'ContentCreation', 'SocialMedia', 'Writing'],
            mentions: [],
            mediaUrls: [],
            likeCount: 123,
            commentCount: 34,
            shareCount: 28,
            impressionCount: 2100,
          },
          {
            userId,
            pillarId: pillars[0].id,
            title: 'Building Resilient Teams',
            content: 'After leading teams for 10+ years, I\'ve learned that resilience isn\'t built overnight. It\'s cultivated through:\n\n🎯 Clear communication during uncertainty\n🤝 Trust-building through transparency\n📈 Learning from failures, not hiding them\n🌱 Investing in people\'s growth\n💪 Celebrating small wins along the way\n\nResilience is a team sport. What strategies work for your team?',
            status: 'scheduled',
            scheduledAt: new Date('2024-01-20T14:00:00Z'),
            hashtags: ['Leadership', 'Teams', 'Resilience', 'Management'],
            mentions: [],
            mediaUrls: [],
            likeCount: 0,
            commentCount: 0,
            shareCount: 0,
            impressionCount: 0,
          },
          {
            userId,
            pillarId: pillars[3].id,
            title: 'My Career Pivot Story',
            content: 'Three years ago, I made the scariest decision of my career - leaving a comfortable corporate job to start my own company.\n\nThe fear was real:\n❌ No guaranteed income\n❌ Leaving behind great colleagues\n❌ Starting from zero\n\nBut the growth has been incredible:\n✅ Learning new skills daily\n✅ Building meaningful relationships\n✅ Creating impact I\'m proud of\n\nSometimes the biggest risks lead to the biggest rewards. What career risk paid off for you?',
            status: 'draft',
            hashtags: ['CareerChange', 'Entrepreneurship', 'Growth', 'PersonalStory'],
            mentions: [],
            mediaUrls: [],
            likeCount: 0,
            commentCount: 0,
            shareCount: 0,
            impressionCount: 0,
          },
        ])
        .returning()

      return {
        success: true,
        message: `Successfully seeded database for user ${userId}`,
        data: {
          pillars: pillars.length,
          posts: posts.length,
          userId
        }
      }
    } catch (error) {
      console.error('Error seeding database:', error)
      throw error
    }
  },
  {
    bodySchema: z.object({}),
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 