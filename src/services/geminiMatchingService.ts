import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
  skills: string[];
  interests: string[];
  bio?: string;
  experience?: string;
  college?: string;
}

interface EnhancedUserData {
  profile: UserProfile;
  posts: Array<{ content: string; tags?: string[] }>;
  projects: Array<{ title: string; description: string; tags?: string[] }>;
}

interface MatchResult {
  user1_id: string;
  user2_id: string;
  match_score: number;
  matching_skills: string[];
  matching_interests: string[];
  ai_reasoning: string;
}

const MATCH_THRESHOLD = 0.3; // Lowered from 0.5 to allow matches with minimal data

const getGeminiAPI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Enhanced basic matching for users with minimal data
const analyzeBasicCompatibility = (
  user1: UserProfile,
  user2: UserProfile,
  eventType?: string
): MatchResult => {
  console.log('[AI Match] Running basic compatibility analysis');
  
  // Check interests overlap
  const matchingInterests = (user1.interests || []).filter(interest => 
    (user2.interests || []).includes(interest)
  );
  
  // Check skills overlap
  const matchingSkills = (user1.skills || []).filter(skill => 
    (user2.skills || []).includes(skill)
  );
  
  // Check event type alignment
  let eventTypeBonus = 0;
  if (eventType && user1.interests && user2.interests) {
    const eventTypeLower = eventType.toLowerCase();
    const user1HasEventInterest = user1.interests.some(i => 
      i.toLowerCase().includes(eventTypeLower) || eventTypeLower.includes(i.toLowerCase())
    );
    const user2HasEventInterest = user2.interests.some(i => 
      i.toLowerCase().includes(eventTypeLower) || eventTypeLower.includes(i.toLowerCase())
    );
    if (user1HasEventInterest && user2HasEventInterest) {
      eventTypeBonus = 0.2; // 20% bonus for event type alignment
    }
  }
  
  // Check college/location match
  const sameCollege = user1.college && user2.college && user1.college === user2.college ? 0.1 : 0;
  
  // Calculate base score from overlaps
  const totalInterests = Math.max(
    (user1.interests?.length || 0),
    (user2.interests?.length || 0),
    1
  );
  const totalSkills = Math.max(
    (user1.skills?.length || 0),
    (user2.skills?.length || 0),
    1
  );
  
  const interestScore = matchingInterests.length / totalInterests;
  const skillScore = matchingSkills.length / totalSkills;
  
  // Weighted average: interests 40%, skills 30%, event type 20%, college 10%
  let matchScore = (interestScore * 0.4) + (skillScore * 0.3) + eventTypeBonus + sameCollege;
  
  // If they have ANY overlap, ensure minimum score of 0.3
  if (matchingInterests.length > 0 || matchingSkills.length > 0) {
    matchScore = Math.max(matchScore, 0.3);
  }
  
  // Cap at 1.0
  matchScore = Math.min(matchScore, 1.0);
  
  // Generate reasoning
  let reasoning = '';
  if (matchScore >= 0.5) {
    reasoning = `Good potential match! `;
  } else if (matchScore >= 0.3) {
    reasoning = `Promising collaboration opportunity! `;
  } else {
    reasoning = `Potential for collaboration. `;
  }
  
  if (matchingInterests.length > 0) {
    reasoning += `Shared interests in ${matchingInterests.slice(0, 3).join(', ')}. `;
  }
  if (matchingSkills.length > 0) {
    reasoning += `Common skills: ${matchingSkills.slice(0, 3).join(', ')}. `;
  }
  if (eventTypeBonus > 0) {
    reasoning += `Both aligned with ${eventType} event type. `;
  }
  if (reasoning === '') {
    reasoning = `Both interested in the same event and open to collaboration.`;
  }

  console.log('[AI Match] Basic match score:', matchScore, {
    matchingInterests,
    matchingSkills,
    eventTypeBonus,
    sameCollege
  });

  return {
    user1_id: user1.id,
    user2_id: user2.id,
    match_score: matchScore,
    matching_skills: matchingSkills,
    matching_interests: matchingInterests,
    ai_reasoning: reasoning.trim(),
  };
};

// Fetch user's posts and projects for deeper analysis
const fetchEnhancedUserData = async (userId: string): Promise<EnhancedUserData | null> => {
  try {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Fetch user's posts
    const { data: posts, error: postsError } = await supabase
      .from('posts' as any)
      .select('content, tags')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch user's projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('title, description, tags')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      profile: profile as UserProfile,
      posts: posts || [],
      projects: projects || [],
    };
  } catch (error) {
    console.error('Error fetching enhanced user data:', error);
    return null;
  }
};

// Enhanced AI analysis with posts, projects, and experience
export const analyzeEnhancedCompatibility = async (
  userData1: EnhancedUserData,
  userData2: EnhancedUserData,
  eventType?: string
): Promise<MatchResult> => {
  try {
    const user1 = userData1.profile;
    const user2 = userData2.profile;

    // Calculate data availability
    const user1DataCount = (userData1.posts?.length || 0) + (userData1.projects?.length || 0);
    const user2DataCount = (userData2.posts?.length || 0) + (userData2.projects?.length || 0);
    const hasMinimalData = user1DataCount < 3 || user2DataCount < 3;

    console.log('[AI Match] Data availability:', {
      user1Posts: userData1.posts?.length || 0,
      user1Projects: userData1.projects?.length || 0,
      user2Posts: userData2.posts?.length || 0,
      user2Projects: userData2.projects?.length || 0,
      hasMinimalData
    });

    // If minimal data, use enhanced basic matching
    if (hasMinimalData) {
      console.log('[AI Match] Using enhanced basic matching due to minimal data');
      return analyzeBasicCompatibility(user1, user2, eventType);
    }

    const genAI = getGeminiAPI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build comprehensive prompt with all available data
    const user1Posts = userData1.posts?.map(p => p.content).join(' | ') || 'No posts yet';
    const user2Posts = userData2.posts?.map(p => p.content).join(' | ') || 'No posts yet';
    const user1Projects = userData1.projects?.map(p => p.title + ': ' + p.description).join(' | ') || 'No projects yet';
    const user2Projects = userData2.projects?.map(p => p.title + ': ' + p.description).join(' | ') || 'No projects yet';

    const prompt = `You are an AI matchmaking assistant for a student collaboration platform. Analyze these two users for potential teamwork compatibility ${eventType ? 'for a ' + eventType + ' event' : ''}.

USER 1 - ${user1.full_name}:
Profile:
- Skills: ${user1.skills?.join(', ') || 'None listed'}
- Interests: ${user1.interests?.join(', ') || 'None listed'}
- Bio: ${user1.bio || 'Not provided'}
- Experience: ${user1.experience || 'Not provided'}
- College: ${user1.college || 'Not provided'}

Recent Posts: ${user1Posts}

Projects: ${user1Projects}

---

USER 2 - ${user2.full_name}:
Profile:
- Skills: ${user2.skills?.join(', ') || 'None listed'}
- Interests: ${user2.interests?.join(', ') || 'None listed'}
- Bio: ${user2.bio || 'Not provided'}
- Experience: ${user2.experience || 'Not provided'}
- College: ${user2.college || 'Not provided'}

Recent Posts: ${user2Posts}

Projects: ${user2Projects}

---

ANALYSIS CRITERIA:
1. **Interest Alignment**: Do their interests and tags overlap? ${eventType ? 'Do they match the ' + eventType + ' event type?' : ''}
2. **Skill Complementarity**: Do they have complementary or matching skills?
3. **Communication Vibe**: Based on their posts and project descriptions, do they have similar communication styles and enthusiasm levels?
4. **Experience Level**: Are they at compatible experience levels for productive collaboration?
5. **Shared Goals**: Do their bios, posts, and projects suggest aligned goals and work ethics?

Note: Be generous with scoring even if data is limited. Focus on potential for collaboration based on available information.

Provide your analysis as JSON:
{
  "match_score": 0.75,
  "matching_skills": ["JavaScript", "Python"],
  "matching_interests": ["AI", "Web Development"],
  "reasoning": "Detailed 2-3 sentence explanation of compatibility based on all available data."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text.trim();
    const jsonStart = jsonText.indexOf('{');
    if (jsonStart !== -1) {
      jsonText = jsonText.substring(jsonStart);
      const endIndex = jsonText.lastIndexOf('}');
      if (endIndex !== -1) {
        jsonText = jsonText.substring(0, endIndex + 1);
      }
    }

    const analysis = JSON.parse(jsonText.trim());

    return {
      user1_id: user1.id,
      user2_id: user2.id,
      match_score: Math.min(Math.max(analysis.match_score, 0), 1),
      matching_skills: analysis.matching_skills || [],
      matching_interests: analysis.matching_interests || [],
      ai_reasoning: analysis.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('Error in enhanced compatibility analysis:', error);
    
    // Fallback to basic matching
    const user1 = userData1.profile;
    const user2 = userData2.profile;
    const matchingSkills = (user1.skills || []).filter(skill => 
      (user2.skills || []).includes(skill)
    );
    const matchingInterests = (user1.interests || []).filter(interest => 
      (user2.interests || []).includes(interest)
    );
    
    const totalMatches = matchingSkills.length + matchingInterests.length;
    const totalItems = Math.max(
      (user1.skills?.length || 0) + (user1.interests?.length || 0),
      (user2.skills?.length || 0) + (user2.interests?.length || 0),
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

// Original function kept for backward compatibility
export const analyzeTeammateCompatibility = async (
  user1: UserProfile,
  user2: UserProfile
): Promise<MatchResult> => {
  try {
    const genAI = getGeminiAPI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = 'You are an AI assistant helping to match teammates for events and projects. Analyze the compatibility between these two users:\\n\\nUser 1 (' + user1.full_name + '):\\n- Skills: ' + (user1.skills?.join(', ') || 'None listed') + '\\n- Interests: ' + (user1.interests?.join(', ') || 'None listed') + '\\n- Bio: ' + (user1.bio || 'Not provided') + '\\n\\nUser 2 (' + user2.full_name + '):\\n- Skills: ' + (user2.skills?.join(', ') || 'None listed') + '\\n- Interests: ' + (user2.interests?.join(', ') || 'None listed') + '\\n- Bio: ' + (user2.bio || 'Not provided') + '\\n\\nAnalyze their compatibility as potential teammates and provide:\\n1. A match score from 0 to 1 (0 = poor match, 1 = excellent match)\\n2. List of matching skills (if any)\\n3. List of matching interests (if any)\\n4. A brief explanation (2-3 sentences) of why they would or wouldn\'t make good teammates\\n\\nFormat your response as JSON:\\n{\\n  "match_score": 0.85,\\n  "matching_skills": ["JavaScript", "Python"],\\n  "matching_interests": ["AI", "Web Development"],\\n  "reasoning": "Both users have strong technical skills and share interests in AI and web development. They complement each other well."\\n}';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text.trim();
    const jsonStart = jsonText.indexOf('{');
    if (jsonStart !== -1) {
      jsonText = jsonText.substring(jsonStart);
      const endIndex = jsonText.lastIndexOf('}');
      if (endIndex !== -1) {
        jsonText = jsonText.substring(0, endIndex + 1);
      }
    }

    const analysis = JSON.parse(jsonText.trim());

    return {
      user1_id: user1.id,
      user2_id: user2.id,
      match_score: Math.min(Math.max(analysis.match_score, 0), 1),
      matching_skills: analysis.matching_skills || [],
      matching_interests: analysis.matching_interests || [],
      ai_reasoning: analysis.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('Error analyzing compatibility:', error);
    
    const matchingSkills = (user1.skills || []).filter(skill => 
      (user2.skills || []).includes(skill)
    );
    const matchingInterests = (user1.interests || []).filter(interest => 
      (user2.interests || []).includes(interest)
    );
    
    const totalMatches = matchingSkills.length + matchingInterests.length;
    const totalItems = Math.max(
      (user1.skills?.length || 0) + (user1.interests?.length || 0),
      (user2.skills?.length || 0) + (user2.interests?.length || 0),
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

export const findEventTeammates = async (eventId: string): Promise<void> => {
  console.log('[AI Match] 1. Starting findEventTeammates for eventId:', eventId);

  try {
    // Fetch event details to get event type
    const { data: eventData, error: eventDataError } = await supabase
      .from('events')
      .select('event_type')
      .eq('id', eventId)
      .single();

    const eventType = eventData?.event_type || undefined;
    console.log('[AI Match] Event type:', eventType);

    const { data: interests, error: interestsError } = await supabase
      .from('event_interests')
      .select('user_id')
      .eq('event_id', eventId);

    if (interestsError) {
      console.error('[AI Match] Error fetching event interests:', interestsError);
      throw new Error('Failed to fetch event interests');
    }

    console.log('[AI Match] 2. Found interested users:', interests?.length || 0);

    if (!interests || interests.length < 2) {
      console.log('[AI Match] Not enough users to form a match. Exiting.');
      return;
    }

    const userIds = interests.map((interest) => interest.user_id);
    
    console.log('[AI Match] 3. Fetching enhanced user data for', userIds.length, 'users...');

    // Fetch enhanced data for all users
    const enhancedUserDataMap = new Map<string, EnhancedUserData>();
    for (const userId of userIds) {
      const userData = await fetchEnhancedUserData(userId);
      if (userData) {
        enhancedUserDataMap.set(userId, userData);
      }
    }

    console.log('[AI Match] 4. Fetched enhanced data for', enhancedUserDataMap.size, 'users');

    if (enhancedUserDataMap.size < 2) {
      console.error('[AI Match] Not enough user data found');
      return;
    }

    // Compare users pairwise with enhanced analysis
    for (let i = 0; i < interests.length; i++) {
      for (let j = i + 1; j < interests.length; j++) {
        const userData1 = enhancedUserDataMap.get(interests[i].user_id);
        const userData2 = enhancedUserDataMap.get(interests[j].user_id);

        if (!userData1 || !userData2) {
          console.warn('[AI Match] Could not find data for one or both users. Skipping.');
          continue;
        }

        console.log('[AI Match] 5. Analyzing:', userData1.profile.full_name, 'and', userData2.profile.full_name);

        // Check for existing match
        const { data: existingMatch, error: existingMatchError } = await supabase
          .from('teammate_matches')
          .select('id')
          .or('and(user1_id.eq.' + userData1.profile.id + ',user2_id.eq.' + userData2.profile.id + '),and(user1_id.eq.' + userData2.profile.id + ',user2_id.eq.' + userData1.profile.id + ')')
          .eq('event_id', eventId)
          .limit(1);

        if (existingMatchError) {
          console.error('[AI Match] Error checking for existing matches:', existingMatchError);
        }
        
        if (existingMatch && existingMatch.length > 0) {
          console.log('[AI Match] Users already have a match for this event. Skipping.');
          continue;
        }

        // Use enhanced compatibility analysis
        const compatibility = await analyzeEnhancedCompatibility(userData1, userData2, eventType);
        console.log('[AI Match] 6. Enhanced compatibility score:', compatibility.match_score);
        console.log('[AI Match] AI Reasoning:', compatibility.ai_reasoning);

        if (compatibility.match_score >= MATCH_THRESHOLD) {
          console.log('[AI Match] 7. Match score is above threshold. Creating match...');
          const { data: match, error: matchError } = await supabase
            .from('teammate_matches')
            .insert({
              user1_id: userData1.profile.id,
              user2_id: userData2.profile.id,
              event_id: eventId,
              compatibility_score: compatibility.match_score,
              ai_reasoning: compatibility.ai_reasoning,
              status: 'pending',
            })
            .select()
            .single();

          if (matchError) {
            console.error('[AI Match] Error creating match record:', matchError);
            throw new Error('Failed to create match record');
          }

          if (match) {
            console.log('[AI Match] 8. Match record created successfully with ID:', match.id);
            await createMatchNotifications(match, eventId);
          }
        } else {
          console.log('[AI Match] Match score below threshold. No match created.');
        }
      }
    }
  } catch (error) {
    console.error('[AI Match] An error occurred in findEventTeammates:', error);
  }
};

export async function createMatchNotifications(match: any, eventId: string) {
  console.log('[AI Match] 9. Inside createMatchNotifications for match ID:', match.id);
  try {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('[AI Match] Error fetching event title for notification:', eventError);
    }
    const eventTitle = event?.title || 'an event';

    const { data: user1, error: user1Error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', match.user1_id)
      .single();
      
    const { data: user2, error: user2Error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', match.user2_id)
      .single();

    if (user1Error || user2Error) {
      console.error('[AI Match] Error fetching user names for notification:', user1Error || user2Error);
    }

    const notificationsToInsert = [
      {
        user_id: match.user1_id,
        type: 'teammate_match',
        title: 'New Teammate Match for ' + eventTitle + '!',
        message: 'You have been matched with ' + (user2?.full_name || 'a user') + '. AI Reasoning: "' + match.ai_reasoning + '"',
        link: '/events/' + eventId,
        metadata: { matchId: match.id },
      },
      {
        user_id: match.user2_id,
        type: 'teammate_match',
        title: 'New Teammate Match for ' + eventTitle + '!',
        message: 'You have been matched with ' + (user1?.full_name || 'a user') + '. AI Reasoning: "' + match.ai_reasoning + '"',
        link: '/events/' + eventId,
        metadata: { matchId: match.id },
      },
    ];

    console.log('[AI Match] 10. Inserting notifications into database:', notificationsToInsert);

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationsToInsert);

    if (notificationError) {
      console.error('[AI Match] Error inserting notifications:', notificationError);
      throw new Error('Failed to insert notifications');
    }

    console.log('[AI Match] 11. Notifications created successfully!');
  } catch (error) {
    console.error('[AI Match] An error occurred in createMatchNotifications:', error);
  }
}
