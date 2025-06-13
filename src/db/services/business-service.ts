import { db } from '@/db'
import { 
  leads, 
  events,
  eq,
  count
} from '@/db/schema'

// ================================
// Business Service (Placeholder)
// ================================

/**
 * Get leads count for a user
 */
export async function getLeadsCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(leads)
    .where(eq(leads.userId, userId))

  return result?.count || 0
}

/**
 * Get events count for a user
 */
export async function getEventsCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.userId, userId))

  return result?.count || 0
} 