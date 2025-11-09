import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, Linkedin, Mail, X, Camera, MessageCircle, Grid3x3, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { ChatDialog } from '@/components/chat/ChatDialog';

interface Profile {
  id: string;
  username: string;
  college: string;
  branch?: string;
  year?: string;
  email?: string;
  avatar_url?: string;
  skills: string[];
  experience?: string; // may contain JSON string with items
  achievements?: any; // may be string[] or JSON string
  projects?: string; // JSON string with project items
  github_url: string;
  linkedin_url: string;
}

type MediaItem = {
  id?: string;
  caption: string;
  file?: File | null;
  url?: string;
};

type ProjectItem = {
  id?: string;
  title: string;
  description: string;
  urls: string[];
  images: MediaItem[];
};

interface Post {
  id: string;
  content: string;
  images: string[];
  created_at: string;
  profiles: {
    username: string;
  };
  likes_count?: number;
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [collaborativeProjects, setCollaborativeProjects] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | undefined>();
  const [editForm, setEditForm] = useState({
    username: '',
    college: '',
    branch: '',
    year: '',
    github_url: '',
    linkedin_url: '',
    email: '',
    skillInput: '',
    skills: [] as string[],
    experienceText: '',
    experienceItems: [] as MediaItem[],
    achievementInput: '',
    achievementItems: [] as MediaItem[],
    projectItems: [] as ProjectItem[],
  });

  const parseExperience = (raw: any) => {
    if (!raw) return { text: '', items: [] as MediaItem[] };
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { text: parsed.text || '', items: parsed.items || [] };
        }
      } catch (e) {
        // not JSON, treat as plain text
        return { text: raw, items: [] as MediaItem[] };
      }
    }
    // other types
    return { text: String(raw), items: [] as MediaItem[] };
  };

  const parseAchievements = (raw: any) => {
    if (!raw) return { list: [] as string[], items: [] as MediaItem[] };
    if (Array.isArray(raw)) return { list: raw, items: [] as MediaItem[] };
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { list: parsed.list || [], items: parsed.items || [] };
        }
      } catch (e) {
        // not JSON
        return { list: [raw], items: [] as MediaItem[] };
      }
    }
    return { list: [], items: [] as MediaItem[] };
  };

  const parseProjects = (raw: any) => {
    if (!raw) return [] as ProjectItem[];
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      const profileData = data as Profile;
      console.log('Fetched profile data:', {
        experience: profileData.experience,
        achievements: profileData.achievements,
        projects: profileData.projects
      });
      
      setProfile(profileData);

      const exp = parseExperience(profileData.experience);
      const ach = parseAchievements(profileData.achievements);
      const proj = parseProjects(profileData.projects);

      console.log('Parsed data:', {
        experience: exp,
        achievements: ach,
        projects: proj
      });

      setEditForm({
        username: profileData.username,
        college: profileData.college || '',
        branch: profileData.branch || '',
        year: profileData.year || '',
        github_url: profileData.github_url || '',
        linkedin_url: profileData.linkedin_url || '',
        email: profileData.email || '',
        skillInput: '',
        skills: profileData.skills || [],
        experienceText: exp.text || '',
        experienceItems: exp.items || [],
        achievementInput: '',
        achievementItems: ach.items || [],
        projectItems: proj || [],
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchUserPosts();
      fetchCollaborativeProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCollaborativeProjects = async () => {
    if (!id) return;
    
    try {
      // Fetch projects where user is owner
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', id);

      // Fetch projects where user is a member
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select(`
          projects (*)
        `)
        .eq('user_id', id);

      const allProjects = [
        ...(ownedProjects || []),
        ...(memberProjects?.map((m: any) => m.projects).filter(Boolean) || [])
      ];

      // Remove duplicates based on project id
      const uniqueProjects = allProjects.filter((project, index, self) =>
        index === self.findIndex((p) => p.id === project.id)
      );

      setCollaborativeProjects(uniqueProjects);
    } catch (error) {
      console.error('Error fetching collaborative projects:', error);
    }
  };

  const fetchUserPosts = async () => {
    if (!id) return;
    
    try {
      setIsLoadingPosts(true);
      const { data, error } = await supabase
        .from('posts' as any)
        .select(`
          id,
          content,
          images,
          created_at,
          profiles (username)
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get likes count for each post
      const postsWithLikes = await Promise.all(
        ((data as any) || []).map(async (post: any) => {
          const { data: likes } = await supabase
            .from('post_likes' as any)
            .select('id')
            .eq('post_id', post.id);
          
          return {
            ...post,
            likes_count: likes?.length || 0
          };
        })
      );
      
      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const uploadFile = async (file: File, destPath: string) => {
    try {
      const { error } = await supabase.storage.from('profile-media').upload(destPath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) throw error;
  const { data } = supabase.storage.from('profile-media').getPublicUrl(destPath);
  // getPublicUrl returns an object with a `data` property containing `publicUrl`
  // return null if not available
  return (data as any)?.publicUrl ?? null;
    } catch (e) {
      console.error('Upload failed', e);
      return null;
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!user) {
      toast.error('You must be signed in to update your profile');
      return;
    }
    if (user.id !== id) {
      toast.error('You can only edit your own profile');
      return;
    }
    try {
      // Upload avatar if changed
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const path = `${profile.id}/avatar/${Date.now()}_${avatarFile.name}`;
        avatarUrl = await uploadFile(avatarFile, path);
      }

      // upload files for experience items
      const expItems = await Promise.all(
        editForm.experienceItems.map(async (it, idx) => {
          if (it.file) {
            const path = `${profile.id}/experience/${Date.now()}_${it.file.name}`;
            const url = await uploadFile(it.file, path);
            return { caption: it.caption, url };
          }
          return { caption: it.caption, url: it.url };
        })
      );

      const achItems = await Promise.all(
        editForm.achievementItems.map(async (it) => {
          if (it.file) {
            const path = `${profile.id}/achievements/${Date.now()}_${it.file.name}`;
            const url = await uploadFile(it.file, path);
            return { caption: it.caption, url };
          }
          return { caption: it.caption, url: it.url };
        })
      );

      // Upload project images
      const projectItems = await Promise.all(
        editForm.projectItems.map(async (proj) => {
          const images = await Promise.all(
            proj.images.map(async (img) => {
              if (img.file) {
                const path = `${profile.id}/projects/${Date.now()}_${img.file.name}`;
                const url = await uploadFile(img.file, path);
                return { caption: img.caption, url };
              }
              return { caption: img.caption, url: img.url };
            })
          );
          return {
            title: proj.title,
            description: proj.description,
            urls: proj.urls,
            images,
          };
        })
      );


      const experiencePayload = JSON.stringify({ text: editForm.experienceText, items: expItems });
      const achievementsPayload = JSON.stringify({ list: [], items: achItems });
      const projectsPayload = JSON.stringify(projectItems);

      // Build payload only with fields that exist in the fetched profile to avoid DB errors
      const updatePayload: any = {
        username: editForm.username,
        college: editForm.college,
        branch: editForm.branch,
        year: editForm.year,
        email: editForm.email,
        github_url: editForm.github_url,
        linkedin_url: editForm.linkedin_url,
        skills: editForm.skills,
      };

      if (avatarUrl) {
        updatePayload.avatar_url = avatarUrl;
      }

      if (Object.prototype.hasOwnProperty.call(profile, 'experience')) {
        updatePayload.experience = experiencePayload;
      }
      if (Object.prototype.hasOwnProperty.call(profile, 'achievements')) {
        updatePayload.achievements = achievementsPayload;
      }
      if (Object.prototype.hasOwnProperty.call(profile, 'projects')) {
        updatePayload.projects = projectsPayload;
      }

      const { data: updateData, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error', error);
        throw error;
      }

      console.log('Profile updated successfully:', updateData);
      toast.success('Profile updated!');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Force refetch to get fresh data
      await fetchProfile();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(msg || 'Failed to update profile');
    }
  };

  const addSkill = () => {
    if (editForm.skillInput.trim() && !editForm.skills.includes(editForm.skillInput.trim())) {
      setEditForm({ ...editForm, skills: [...editForm.skills, editForm.skillInput.trim()], skillInput: '' });
    }
  };

  const removeSkill = (skill: string) => setEditForm({ ...editForm, skills: editForm.skills.filter(s => s !== skill) });

  const addExperienceItem = () => {
    setEditForm({ ...editForm, experienceItems: [...editForm.experienceItems, { caption: '', file: null }] });
  };

  const removeExperienceItem = (idx: number) => {
    const items = editForm.experienceItems.slice();
    items.splice(idx, 1);
    setEditForm({ ...editForm, experienceItems: items });
  };

  const addAchievementItem = () => {
    setEditForm({ ...editForm, achievementItems: [...editForm.achievementItems, { caption: '', file: null }] });
  };

  const removeAchievementItem = (idx: number) => {
    const items = editForm.achievementItems.slice();
    items.splice(idx, 1);
    setEditForm({ ...editForm, achievementItems: items });
  };

  const addProjectItem = () => {
    setEditForm({
      ...editForm,
      projectItems: [
        ...editForm.projectItems,
        { title: '', description: '', urls: [], images: [] }
      ]
    });
  };

  const removeProjectItem = (idx: number) => {
    const items = editForm.projectItems.slice();
    items.splice(idx, 1);
    setEditForm({ ...editForm, projectItems: items });
  };

  const addProjectImage = (projIdx: number) => {
    const items = editForm.projectItems.slice();
    items[projIdx].images.push({ caption: '', file: null });
    setEditForm({ ...editForm, projectItems: items });
  };

  const removeProjectImage = (projIdx: number, imgIdx: number) => {
    const items = editForm.projectItems.slice();
    items[projIdx].images.splice(imgIdx, 1);
    setEditForm({ ...editForm, projectItems: items });
  };

  const addProjectUrl = (projIdx: number) => {
    const items = editForm.projectItems.slice();
    items[projIdx].urls.push('');
    setEditForm({ ...editForm, projectItems: items });
  };

  const removeProjectUrl = (projIdx: number, urlIdx: number) => {
    const items = editForm.projectItems.slice();
    items[projIdx].urls.splice(urlIdx, 1);
    setEditForm({ ...editForm, projectItems: items });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartChat = async () => {
    if (!user || !profile || user.id === profile.id) return;

    try {
      console.log('Creating conversation between:', user.id, 'and', profile.id);
      
      const { data, error } = await (supabase.rpc as any)('get_or_create_direct_conversation', {
        user1_id: user.id,
        user2_id: profile.id
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('Conversation ID received:', data);

      if (!data) {
        throw new Error('No conversation ID returned');
      }

      setChatConversationId(data);
      setShowChat(true);
      toast.success('Opening conversation...');
    } catch (error: any) {
      console.error('Error starting chat:', error);
      
      // Provide more helpful error message
      if (error.message?.includes('function') || error.code === '42883') {
        toast.error('Chat system not set up yet. Please run the database migration.');
      } else if (error.message?.includes('permission')) {
        toast.error('Permission denied. Please check database policies.');
      } else {
        toast.error('Failed to start conversation: ' + (error.message || 'Unknown error'));
      }
    }
  };

  if (!profile) return <div className="p-6 text-center">Loading...</div>;

  const isOwnProfile = user?.id === id;

  return (
    <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <aside className="col-span-1">
        <Card>
          <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
            {/* Avatar with upload option */}
            <div className="relative group">
              <Avatar className="h-28 w-28">
                {(avatarPreview || profile.avatar_url) ? (
                  <img 
                    src={avatarPreview || profile.avatar_url} 
                    alt={profile.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {profile.username[0].toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>
            
            {/* Display mode - Show name, branch, year, college */}
            {!isEditing && (
              <div className="w-full space-y-2">
                <h2 className="text-xl font-bold">{profile.username}</h2>
                {(profile.branch || profile.year) && (
                  <p className="text-sm text-muted-foreground">
                    {profile.branch && profile.branch}
                    {profile.branch && profile.year && ' • '}
                    {profile.year && profile.year}
                  </p>
                )}
                {profile.college && (
                  <p className="text-sm text-muted-foreground">{profile.college}</p>
                )}
              </div>
            )}
            
            <div className="w-full">
              {isEditing ? (
                <div className="w-full space-y-2">
                  <div>
                    <Label>Name</Label>
                    <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                  </div>
                  <div>
                    <Label>Branch</Label>
                    <Input value={editForm.branch} onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })} placeholder="e.g., Computer Science, IT, BCA" />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} placeholder="e.g., First Year, Second Year" />
                  </div>
                  <div>
                    <Label>College</Label>
                    <Input value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div>
                    <Label>GitHub URL</Label>
                    <Input value={editForm.github_url} onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })} placeholder="https://github.com/username" />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input value={editForm.linkedin_url} onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/username" />
                  </div>
                </div>
              ) : (
                <div className="w-full pt-2 border-t">
                  <h4 className="text-sm font-semibold mb-2">Contact</h4>
                  <div className="flex flex-col gap-2">
                    {profile.email && (
                      <a className="flex items-center gap-2 text-sm hover:text-primary transition-colors" href={`mailto:${profile.email}`}>
                        <Mail className="h-4 w-4" /> <span className="truncate">{profile.email}</span>
                      </a>
                    )}
                    {profile.github_url && (
                      <a className="flex items-center gap-2 text-sm hover:text-primary transition-colors" href={profile.github_url} target="_blank" rel="noreferrer">
                        <Github className="h-4 w-4" /> <span className="truncate">GitHub</span>
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a className="flex items-center gap-2 text-sm hover:text-primary transition-colors" href={profile.linkedin_url} target="_blank" rel="noreferrer">
                        <Linkedin className="h-4 w-4" /> <span className="truncate">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Main content */}
      <main className="col-span-1 md:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Profile</CardTitle>
              <div className="flex gap-2">
                {!isOwnProfile && (
                  <Button 
                    onClick={handleStartChat}
                    variant="gradient"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                )}
                {isOwnProfile && (
                  isEditing ? (
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      fetchProfile(); // Reset form to saved state
                    }}>
                      ← Back to Profile
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                  )
                )}
              </div>
              </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skills / Interests */}
            <section>
              <h3 className="font-semibold mb-2">Interests / Skills</h3>
              {isEditing ? (
                <div>
                  <div className="flex gap-2">
                    <Input value={editForm.skillInput} onChange={(e) => setEditForm({ ...editForm, skillInput: e.target.value })} placeholder="Add a skill" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                    <Button onClick={addSkill} variant="outline">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editForm.skills.map(s => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        {s}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(s)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              )}
            </section>

            {/* Experience */}
            <section>
              <h3 className="font-semibold mb-2">Experience</h3>
              {isEditing ? (
                <div className="space-y-3">
                  <Label>Summary</Label>
                  <textarea value={editForm.experienceText} onChange={(e) => setEditForm({ ...editForm, experienceText: e.target.value })} className="w-full p-2 border rounded" rows={3} />

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Experience items (images + caption)</Label>
                      <Button size="sm" onClick={addExperienceItem} variant="outline">Add item</Button>
                    </div>

                    <div className="space-y-2 mt-2">
                      {editForm.experienceItems.map((it, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            const items = editForm.experienceItems.slice();
                            items[idx] = { ...items[idx], file };
                            setEditForm({ ...editForm, experienceItems: items });
                          }} />
                          <input className="flex-1 p-2 border rounded" placeholder="Caption" value={it.caption} onChange={(e) => {
                            const items = editForm.experienceItems.slice();
                            items[idx] = { ...items[idx], caption: e.target.value };
                            setEditForm({ ...editForm, experienceItems: items });
                          }} />
                          <Button variant="ghost" onClick={() => removeExperienceItem(idx)}>Remove</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const exp = parseExperience(profile.experience);
                    return (
                      <>
                        {exp.text ? <p className="text-sm text-muted-foreground">{exp.text}</p> : <p className="text-sm text-muted-foreground">No experience listed.</p>}
                        {exp.items && exp.items.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                            {exp.items.map((it: any, i: number) => (
                              <div key={i} className="border rounded overflow-hidden">
                                {it.url && <img src={it.url} alt={it.caption} className="w-full h-40 object-cover" />}
                                <div className="p-2">{it.caption}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </section>

            {/* Collaborative Projects (from projects table) */}
            <section>
              <h3 className="font-semibold mb-2">Collaborative Projects</h3>
              <div className="space-y-3">
                {collaborativeProjects.length > 0 ? (
                  collaborativeProjects.map((project: any) => (
                    <Card 
                      key={project.id} 
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{project.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {project.description}
                          </p>
                          {project.skills_needed && project.skills_needed.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.skills_needed.slice(0, 5).map((skill: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {project.skills_needed.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{project.skills_needed.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {project.owner_id === id && (
                          <Badge variant="default" className="ml-2">Owner</Badge>
                        )}
                        {project.owner_id !== id && (
                          <Badge variant="outline" className="ml-2">Collaborator</Badge>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No collaborative projects yet. {isOwnProfile && "Join or create a project to get started!"}
                  </p>
                )}
              </div>
            </section>

            {/* Achievements */}
            <section>
              <h3 className="font-semibold mb-2">Achievements</h3>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Add achievements (image + caption)</Label>
                    <Button size="sm" onClick={addAchievementItem} variant="outline">Add item</Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {editForm.achievementItems.map((it, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          const items = editForm.achievementItems.slice();
                          items[idx] = { ...items[idx], file };
                          setEditForm({ ...editForm, achievementItems: items });
                        }} />
                        <input className="flex-1 p-2 border rounded" placeholder="Caption" value={it.caption} onChange={(e) => {
                          const items = editForm.achievementItems.slice();
                          items[idx] = { ...items[idx], caption: e.target.value };
                          setEditForm({ ...editForm, achievementItems: items });
                        }} />
                        <Button variant="ghost" onClick={() => removeAchievementItem(idx)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const ach = parseAchievements(profile.achievements);
                    return (
                      <>
                        {ach.list && ach.list.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {ach.list.map((t: string, i: number) => (
                              <Badge key={i} variant="secondary">{t}</Badge>
                            ))}
                          </div>
                        )}
                        {ach.items && ach.items.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                            {ach.items.map((it: any, i: number) => (
                              <div key={i} className="border rounded overflow-hidden">
                                {it.url && <img src={it.url} alt={it.caption} className="w-full h-36 object-cover" />}
                                <div className="p-2">{it.caption}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </section>

            {/* Projects */}
            <section>
              <h3 className="font-semibold mb-2">Projects</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Add your projects</Label>
                    <Button size="sm" onClick={addProjectItem} variant="outline">Add Project</Button>
                  </div>
                  
                  {editForm.projectItems.map((proj, projIdx) => (
                    <Card key={projIdx} className="p-4 border-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Project {projIdx + 1}</Label>
                          <Button size="sm" variant="ghost" onClick={() => removeProjectItem(projIdx)}>Remove</Button>
                        </div>
                        
                        <div>
                          <Label>Title</Label>
                          <Input 
                            value={proj.title}
                            onChange={(e) => {
                              const items = editForm.projectItems.slice();
                              items[projIdx].title = e.target.value;
                              setEditForm({ ...editForm, projectItems: items });
                            }}
                            placeholder="Project name"
                          />
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <textarea 
                            value={proj.description}
                            onChange={(e) => {
                              const items = editForm.projectItems.slice();
                              items[projIdx].description = e.target.value;
                              setEditForm({ ...editForm, projectItems: items });
                            }}
                            className="w-full p-2 border rounded"
                            rows={3}
                            placeholder="Describe your project..."
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>URLs (GitHub, Demo, etc.)</Label>
                            <Button size="sm" variant="outline" onClick={() => addProjectUrl(projIdx)}>Add URL</Button>
                          </div>
                          {proj.urls.map((url, urlIdx) => (
                            <div key={urlIdx} className="flex gap-2 mb-2">
                              <Input
                                value={url}
                                onChange={(e) => {
                                  const items = editForm.projectItems.slice();
                                  items[projIdx].urls[urlIdx] = e.target.value;
                                  setEditForm({ ...editForm, projectItems: items });
                                }}
                                placeholder="https://..."
                              />
                              <Button size="sm" variant="ghost" onClick={() => removeProjectUrl(projIdx, urlIdx)}>✕</Button>
                            </div>
                          ))}
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Images</Label>
                            <Button size="sm" variant="outline" onClick={() => addProjectImage(projIdx)}>Add Image</Button>
                          </div>
                          {proj.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="flex items-start gap-2 mb-2">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  const items = editForm.projectItems.slice();
                                  items[projIdx].images[imgIdx].file = file;
                                  setEditForm({ ...editForm, projectItems: items });
                                }}
                              />
                              <input
                                className="flex-1 p-2 border rounded"
                                placeholder="Caption"
                                value={img.caption}
                                onChange={(e) => {
                                  const items = editForm.projectItems.slice();
                                  items[projIdx].images[imgIdx].caption = e.target.value;
                                  setEditForm({ ...editForm, projectItems: items });
                                }}
                              />
                              <Button size="sm" variant="ghost" onClick={() => removeProjectImage(projIdx, imgIdx)}>✕</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const projects = parseProjects(profile.projects);
                    return projects.length > 0 ? (
                      projects.map((proj: ProjectItem, i: number) => (
                        <Card key={i} className="p-4 hover:shadow-lg transition-shadow">
                          <h4 className="font-bold text-lg mb-2">{proj.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{proj.description}</p>
                          
                          {proj.urls && proj.urls.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold mb-1">Links:</p>
                              <div className="flex flex-wrap gap-2">
                                {proj.urls.map((url, idx) => (
                                  <a 
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    🔗 {url.length > 30 ? url.substring(0, 30) + '...' : url}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {proj.images && proj.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {proj.images.map((img: any, idx: number) => (
                                <div key={idx} className="border rounded overflow-hidden">
                                  {img.url && <img src={img.url} alt={img.caption} className="w-full h-32 object-cover" />}
                                  {img.caption && <div className="p-2 text-xs">{img.caption}</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No projects added yet.</p>
                    );
                  })()}
                </div>
              )}
            </section>

            {/* Save / Cancel */}
            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* User Posts Section - Instagram Style */}
      {!isEditing && (
        <div className="col-span-full mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                <CardTitle>Posts</CardTitle>
                <Badge variant="secondary">{posts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Grid3x3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No posts yet</p>
                  {isOwnProfile && (
                    <p className="text-sm mt-1">Share your first post on Campus Feed!</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-2">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg bg-secondary"
                      onClick={() => navigate('/')}
                    >
                      {post.images && post.images.length > 0 ? (
                        <>
                          <img
                            src={post.images[0]}
                            alt="Post"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          {post.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              +{post.images.length - 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3">
                          <p className="text-xs line-clamp-4 text-center">
                            {post.content}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-4 text-white">
                          <div className="flex items-center gap-1">
                            <Heart className="h-5 w-5 fill-current" />
                            <span className="font-semibold">{post.likes_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Dialog */}
      <ChatDialog 
        open={showChat} 
        onOpenChange={setShowChat}
        initialConversationId={chatConversationId}
      />
    </div>
  );
}