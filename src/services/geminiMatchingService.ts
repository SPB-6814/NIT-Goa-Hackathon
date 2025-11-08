import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  username: string;
  skills: string[];
  interests: string[];
  bio?: string;
}

interface MatchResult {
  user1_id: string;
  user2_id: string;
  match_score: number;
  matching_skills: string[];
  matching_interests: string[];
  ai_reasoning: string;
}

// Initialize Gemini API
const getGeminiAPI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Use Gemini AI to analyze compatibility between two users
 */
export const analyzeTeammateCompatibility = async (
  user1: UserProfile,
  user2: UserProfile
): Promise<MatchResult> => {
  try {
    const genAI = getGeminiAPI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are an AI assistant helping to match teammates for events and projects. Analyze the compatibility between these two users:

User 1 (${user1.username}):
- Skills: ${user1.skills.join(', ') || 'None listed'}
- Interests: ${user1.interests.join(', ') || 'None listed'}
- Bio: ${user1.bio || 'Not provided'}

User 2 (${user2.username}):
- Skills: ${user2.skills.join(', ') || 'None listed'}
- Interests: ${user2.interests.join(', ') || 'None listed'}
- Bio: ${user2.bio || 'Not provided'}

Analyze their compatibility as potential teammates and provide:
1. A match score from 0 to 1 (0 = poor match, 1 = excellent match)
2. List of matching skills (if any)
3. List of matching interests (if any)
4. A brief explanation (2-3 sentences) of why they would or wouldn't make good teammates

Format your response as JSON:
{
  "match_score": 0.85,
  "matching_skills": ["JavaScript", "Python"],
  "matching_interests": ["AI", "Web Development"],
  "reasoning": "Both users have strong technical skills and share interests in AI and web development. They complement each other well."
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(jsonText);

    return {
      user1_id: user1.id,
      user2_id: user2.id,
      match_score: Math.min(Math.max(analysis.match_score, 0), 1), // Clamp between 0 and 1
      matching_skills: analysis.matching_skills || [],
      matching_interests: analysis.matching_interests || [],
      ai_reasoning: analysis.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('Error analyzing compatibility:', error);
    
    // Fallback to basic matching if AI fails
    const matchingSkills = user1.skills.filter(skill => 
      user2.skills.includes(skill)
    );
    const matchingInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    );
    
    const totalMatches = matchingSkills.length + matchingInterests.length;
    const totalItems = Math.max(
      user1.skills.length + user1.interests.length,
      user2.skills.length + user2.interests.length,
      1
    );
    const matchScore = totalMatches / totalItems;

    return {
      user1_id: user1.id,
      user2_id: user2.id,
      match_score: matchScore,
      matching_skills: matchingSkills,
      matching_interests: matchingInterests,
      ai_reasoning: 'Basic compatibility analysis (AI service unavailable)',
    };
  }
};

/**
 * Find and create matches for users interested in the same event
 */
export const findEventTeammates = async (eventId: string): Promise<void> => {
  try {
    // Get all users interested in this event
    const { data: interests, error: interestsError } = await supabase
      .from('event_interests' as any)
      .select(`
        user_id,
        profiles!event_interests_user_id_fkey (
          id,
          username,
          skills,
          interests,
          bio
        )
      `)
      .eq('event_id', eventId);

    if (interestsError) throw interestsError;
    if (!interests || interests.length < 2) {
      console.log('Not enough users interested in event for matching');
      return;
    }

    const users: UserProfile[] = interests.map((i: any) => ({
      id: i.profiles.id,
      username: i.profiles.username,
      skills: i.profiles.skills || [],
      interests: i.profiles.interests || [],
      bio: i.profiles.bio,
    }));

    // Check existing matches to avoid duplicates
    const { data: existingMatches } = await supabase
      .from('teammate_matches' as any)
      .select('user1_id, user2_id')
      .eq('event_id', eventId);

    const existingPairs = new Set(
      (existingMatches || []).map((m: any) => 
        [m.user1_id, m.user2_id].sort().join('-')
      )
    );

    // Compare each pair of users
    const matches: MatchResult[] = [];
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];
        
        // Check if match already exists
        const pairKey = [user1.id, user2.id].sort().join('-');
        if (existingPairs.has(pairKey)) {
          console.log(`Match already exists for ${user1.username} and ${user2.username}`);
          continue;
        }

        // Use AI to analyze compatibility
        const matchResult = await analyzeTeammateCompatibility(user1, user2);
        
        // Only create matches with score > 0.5
        if (matchResult.match_score > 0.5) {
          matches.push(matchResult);
        }
      }
    }

    // Save matches to database
    if (matches.length > 0) {
      const matchRecords = matches.map(match => ({
        event_id: eventId,
        user1_id: match.user1_id,
        user2_id: match.user2_id,
        match_score: match.match_score,
        matching_skills: match.matching_skills,
        matching_interests: match.matching_interests,
        ai_reasoning: match.ai_reasoning,
        status: 'pending',
      }));

      const { error: insertError } = await supabase
        .from('teammate_matches' as any)
        .insert(matchRecords);

      if (insertError) throw insertError;

      // Create notifications for matched users
      for (const match of matches) {
        await createMatchNotifications(match, eventId);
      }

      console.log(`Created ${matches.length} new teammate matches for event ${eventId}`);
    }
  } catch (error) {
    console.error('Error finding event teammates:', error);
    throw error;
  }
};

/**
 * Create notifications for both users in a match
 */
const createMatchNotifications = async (
  match: MatchResult,
  eventId: string
): Promise<void> => {
  try {
    // Get event details
    const { data: event } = await supabase
      .from('events' as any)
      .select('title')
      .eq('id', eventId)
      .single();

    // Get user details
    const { data: user1 } = await supabase
      .from('profiles' as any)
      .select('username')
      .eq('id', match.user1_id)
      .single();

    const { data: user2 } = await supabase
      .from('profiles' as any)
      .select('username')
      .eq('id', match.user2_id)
      .single();

    const eventTitle = event?.title || 'the event';
    const user1Name = user1?.username || 'A user';
    const user2Name = user2?.username || 'A user';

    const notifications = [
      {
        user_id: match.user1_id,
        type: 'teammate_match',
        title: '🎯 Teammate Match Found!',
        message: `We found a great teammate match for you! ${user2Name} shares ${match.matching_skills.length + match.matching_interests.length} common skills/interests for "${eventTitle}".`,
        data: {
          event_id: eventId,
          matched_user_id: match.user2_id,
          match_score: match.match_score,
          ai_reasoning: match.ai_reasoning,
        },
        is_read: false,
      },
      {
        user_id: match.user2_id,
        type: 'teammate_match',
        title: '🎯 Teammate Match Found!',
        message: `We found a great teammate match for you! ${user1Name} shares ${match.matching_skills.length + match.matching_interests.length} common skills/interests for "${eventTitle}".`,
        data: {
          event_id: eventId,
          matched_user_id: match.user1_id,
          match_score: match.match_score,
          ai_reasoning: match.ai_reasoning,
        },
        is_read: false,
      },
    ];

    const { error } = await supabase
      .from('notifications' as any)
      .insert(notifications);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating match notifications:', error);
  }
};
