import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
}

interface Profile {
  id: string;
  username: string;
  skills: string[];
  experience?: string;
  projects?: string;
}

/**
 * Calculate compatibility score between a project and a user
 * Returns a score between 0.00 and 1.00
 */
export function calculateCompatibility(
  project: Project,
  userProfile: Profile
): {
  score: number;
  matchingSkills: string[];
  reason: string;
} {
  const projectSkills = (project.required_skills || []).map(s => s.toLowerCase());
  const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());

  // Find matching skills
  const matchingSkills = projectSkills.filter(ps =>
    userSkills.some(us => us.includes(ps) || ps.includes(us))
  );

  // Base score from skill matches
  let score = matchingSkills.length / Math.max(projectSkills.length, 1);

  // Bonus for having more skills than required
  if (userSkills.length > projectSkills.length) {
    score += 0.1;
  }

  // Parse user's projects to check for relevant experience
  try {
    if (userProfile.projects) {
      const userProjects = JSON.parse(userProfile.projects);
      if (Array.isArray(userProjects) && userProjects.length > 0) {
        // Check if any user project descriptions match project keywords
        const projectKeywords = project.description.toLowerCase().split(' ');
        const hasRelevantExperience = userProjects.some((up: any) => {
          const desc = (up.description || '').toLowerCase();
          return projectKeywords.some(kw => kw.length > 4 && desc.includes(kw));
        });

        if (hasRelevantExperience) {
          score += 0.15;
        }
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  // Cap score at 1.00
  score = Math.min(score, 1.00);

  // Generate reason
  let reason = '';
  if (matchingSkills.length > 0) {
    reason = `Strong match! Has ${matchingSkills.length} of ${projectSkills.length} required skills: ${matchingSkills.slice(0, 3).join(', ')}`;
  } else if (userSkills.length > 0) {
    reason = `Has ${userSkills.length} relevant skills that could complement the team`;
  } else {
    reason = `Enthusiastic member who can learn and contribute`;
  }

  if (score > 0.7) {
    reason = '⭐ ' + reason + '. Highly recommended!';
  } else if (score > 0.4) {
    reason = '✨ ' + reason + '. Good fit!';
  }

  return {
    score: Math.round(score * 100) / 100,
    matchingSkills,
    reason
  };
}

/**
 * Generate team recommendations for a project
 */
export async function generateTeamRecommendations(projectId: string): Promise<void> {
  try {
    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects' as any)
      .select('id, title, description, required_skills, owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Get existing team members
    const { data: existingMembers, error: membersError } = await supabase
      .from('project_members' as any)
      .select('user_id')
      .eq('project_id', projectId);

    if (membersError) throw membersError;

    const existingMemberIds = (existingMembers || []).map((m: any) => m.user_id);
    const excludeIds = [...existingMemberIds, (project as any).owner_id];

    // Get all users (excluding owner and existing members)
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles' as any)
      .select('id, username, skills, experience, projects')
      .not('id', 'in', `(${excludeIds.join(',')})`);

    if (profilesError) throw profilesError;

    // Calculate compatibility for each user
    const recommendations = ((allProfiles as any) || [])
      .map((profile: Profile) => {
        const compatibility = calculateCompatibility(project as any, profile);
        return {
          project_id: projectId,
          recommended_user_id: profile.id,
          compatibility_score: compatibility.score,
          matching_skills: compatibility.matchingSkills,
          reason: compatibility.reason
        };
      })
      .filter(r => r.compatibility_score > 0.1) // Only recommend if score > 10%
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, 10); // Top 10 recommendations

    // Delete old recommendations
    await supabase
      .from('team_recommendations' as any)
      .delete()
      .eq('project_id', projectId);

    // Insert new recommendations
    if (recommendations.length > 0) {
      const { error: insertError } = await supabase
        .from('team_recommendations' as any)
        .insert(recommendations);

      if (insertError) throw insertError;
    }

    console.log(`Generated ${recommendations.length} team recommendations for project ${projectId}`);
  } catch (error) {
    console.error('Error generating team recommendations:', error);
    throw error;
  }
}

/**
 * Get team recommendations for a project
 */
export async function getTeamRecommendations(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('team_recommendations' as any)
      .select(`
        *,
        profiles:recommended_user_id (
          id,
          username,
          avatar_url,
          skills,
          college,
          branch,
          year
        )
      `)
      .eq('project_id', projectId)
      .order('compatibility_score', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching team recommendations:', error);
    return [];
  }
}
