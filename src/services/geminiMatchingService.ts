import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
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

const MATCH_THRESHOLD = 0.5;

const getGeminiAPI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

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
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error('[AI Match] Error fetching profiles:', profilesError);
      throw new Error('Failed to fetch profiles');
    }
    
    console.log('[AI Match] 3. Fetched user profiles:', profiles?.length || 0);

    if (!profiles) {
      console.error('[AI Match] No profiles found');
      return;
    }

    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    for (let i = 0; i < interests.length; i++) {
      for (let j = i + 1; j < interests.length; j++) {
        const user1 = profileMap.get(interests[i].user_id);
        const user2 = profileMap.get(interests[j].user_id);

        if (!user1 || !user2) {
          console.warn('[AI Match] Could not find profile for one or both users in a pair. Skipping.');
          continue;
        }

        console.log('[AI Match] 4. Comparing users:', user1.full_name, 'and', user2.full_name);

        const { data: existingMatch, error: existingMatchError } = await supabase
          .from('teammate_matches')
          .select('id')
          .or('and(user1_id.eq.' + user1.id + ',user2_id.eq.' + user2.id + '),and(user1_id.eq.' + user2.id + ',user2_id.eq.' + user1.id + ')')
          .eq('event_id', eventId)
          .limit(1);

        if (existingMatchError) {
          console.error('[AI Match] Error checking for existing matches:', existingMatchError);
        }
        
        if (existingMatch && existingMatch.length > 0) {
          console.log('[AI Match] Users already have a match for this event. Skipping.');
          continue;
        }

        const compatibility = await analyzeTeammateCompatibility(user1, user2);
        console.log('[AI Match] 5. Compatibility score:', compatibility.match_score, compatibility);

        if (compatibility.match_score >= MATCH_THRESHOLD) {
          console.log('[AI Match] 6. Match score is above threshold. Creating match...');
          const { data: match, error: matchError } = await supabase
            .from('teammate_matches')
            .insert({
              user1_id: user1.id,
              user2_id: user2.id,
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
            console.log('[AI Match] 7. Match record created successfully with ID:', match.id);
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
  console.log('[AI Match] 8. Inside createMatchNotifications for match ID:', match.id);
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

    console.log('[AI Match] 9. Inserting notifications into database:', notificationsToInsert);

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationsToInsert);

    if (notificationError) {
      console.error('[AI Match] Error inserting notifications:', notificationError);
      throw new Error('Failed to insert notifications');
    }

    console.log('[AI Match] 10. Notifications created successfully!');
  } catch (error) {
    console.error('[AI Match] An error occurred in createMatchNotifications:', error);
  }
}
