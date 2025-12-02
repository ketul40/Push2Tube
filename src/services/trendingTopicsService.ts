/**
 * Trending Topics Service
 * Provides trending topics and detailed prompts for YouTube Shorts
 */

export interface TrendingTopic {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  trending: boolean;
}

/**
 * Get curated trending topics for YouTube Shorts
 * These are optimized for short-form viral content
 */
export function getTrendingTopics(): TrendingTopic[] {
  return [
    {
      id: '1',
      category: 'Lifestyle',
      title: 'Morning Routine Transformation',
      description: 'Show a dramatic before/after morning routine transformation',
      prompt: 'A cinematic time-lapse of a morning routine transformation: person waking up, stretching, making coffee, working out, and ending with a confident smile. Bright, energetic lighting with smooth transitions between activities.',
      tags: ['lifestyle', 'motivation', 'routine', 'self-improvement'],
      trending: true,
    },
    {
      id: '2',
      category: 'Tech',
      title: 'AI Life Hacks',
      description: 'Quick AI-powered life hacks that save time',
      prompt: 'Fast-paced montage showing AI tools solving everyday problems: AI writing emails, generating meal plans, organizing schedules. Modern, clean aesthetic with text overlays showing time saved.',
      tags: ['tech', 'ai', 'productivity', 'lifehacks'],
      trending: true,
    },
    {
      id: '3',
      category: 'Entertainment',
      title: 'Satisfying Visual Loops',
      description: 'Mesmerizing visual loops that are oddly satisfying',
      prompt: 'A perfectly looped animation of colorful paint mixing, geometric patterns morphing, or kinetic sand being shaped. Smooth, hypnotic motion with vibrant colors and satisfying textures.',
      tags: ['satisfying', 'visual', 'loop', 'asmr'],
      trending: true,
    },
    {
      id: '4',
      category: 'Food',
      title: 'Quick Recipe Hacks',
      description: '30-second recipe transformations that look amazing',
      prompt: 'A rapid-fire cooking transformation: simple ingredients being combined and transformed into an impressive dish. Close-up shots of sizzling, mixing, and final presentation with appetizing lighting.',
      tags: ['food', 'recipe', 'cooking', 'hacks'],
      trending: true,
    },
    {
      id: '5',
      category: 'Fitness',
      title: 'Quick Workout Wins',
      description: 'Fast workout routines that deliver results',
      prompt: 'Energetic montage of quick workout exercises: jumping jacks, push-ups, squats, and stretches. Dynamic camera angles, motivational music vibe, showing progress and energy.',
      tags: ['fitness', 'workout', 'health', 'motivation'],
      trending: true,
    },
    {
      id: '6',
      category: 'Travel',
      title: 'Hidden Gems Revealed',
      description: 'Stunning hidden locations that will blow your mind',
      prompt: 'Aerial and ground shots of a breathtaking hidden location: crystal clear water, unique rock formations, or secret beach. Smooth camera movements revealing the beauty with golden hour lighting.',
      tags: ['travel', 'adventure', 'nature', 'exploration'],
      trending: true,
    },
    {
      id: '7',
      category: 'Motivation',
      title: 'Success Mindset Shift',
      description: 'Powerful visual metaphors for personal growth',
      prompt: 'Symbolic transformation: person walking through different environments representing growth stages - from dark tunnel to bright open field, showing journey of self-improvement with inspiring visuals.',
      tags: ['motivation', 'growth', 'mindset', 'inspiration'],
      trending: true,
    },
    {
      id: '8',
      category: 'Science',
      title: 'Mind-Blowing Facts',
      description: 'Visual explanations of fascinating scientific concepts',
      prompt: 'Animated visualization of a mind-blowing scientific fact: atoms, space phenomena, or natural processes. Clean, educational style with engaging graphics and smooth animations.',
      tags: ['science', 'education', 'facts', 'learning'],
      trending: true,
    },
  ];
}

/**
 * Get trending topics by category
 */
export function getTrendingTopicsByCategory(category: string): TrendingTopic[] {
  return getTrendingTopics().filter(topic => topic.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get a random trending topic
 */
export function getRandomTrendingTopic(): TrendingTopic {
  const topics = getTrendingTopics();
  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Search trending topics by keyword
 */
export function searchTrendingTopics(keyword: string): TrendingTopic[] {
  const lowerKeyword = keyword.toLowerCase();
  return getTrendingTopics().filter(
    topic =>
      topic.title.toLowerCase().includes(lowerKeyword) ||
      topic.description.toLowerCase().includes(lowerKeyword) ||
      topic.category.toLowerCase().includes(lowerKeyword) ||
      topic.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}



