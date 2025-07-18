import { actor } from "@rivetkit/actor";
import { drizzle } from "@rivetkit/drizzle";
import { limiters } from "./schema";

// Simple rate limiter - allows 5 requests per minute
const rateLimiter = actor({
	sql: drizzle(),

	actions: {
		// Check if request is allowed
		checkLimit: async (c) => {
			const now = Date.now();

			// Get the current limiter state from database
			const limiterState = await c.db.select().from(limiters).get();

			// If no record exists, create one
			if (!limiterState) {
				await c.db.insert(limiters).values({
					count: 1,
					resetAt: now + 60000, // 1 minute window
				});

				return {
					allowed: true,
					remaining: 4,
					resetsIn: 60,
				};
			}

			// Reset if expired
			if (now > limiterState.resetAt) {
				await c.db.update(limiters).set({
					count: 1,
					resetAt: now + 60000, // 1 minute window
				});

				return {
					allowed: true,
					remaining: 4,
					resetsIn: 60,
				};
			}

			// Check if under limit
			const allowed = limiterState.count < 5;

			// Increment if allowed
			if (allowed) {
				await c.db.update(limiters).set({ count: limiterState.count + 1 });
			}

			return {
				allowed,
				remaining: 5 - (allowed ? limiterState.count + 1 : limiterState.count),
				resetsIn: Math.round((limiterState.resetAt - now) / 1000),
			};
		},
	},
});

export default rateLimiter;
