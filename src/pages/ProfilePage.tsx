import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Github, Linkedin, Mail, X } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  college: string;
  skills: string[];
  experience?: string; // may contain JSON string with items
  achievements?: any; // may be string[] or JSON string
  github_url: string;
  linkedin_url: string;
  email?: string;
}

type MediaItem = {
  id?: string;
  caption: string;
  file?: File | null;
  url?: string;
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    college: '',
    github_url: '',
    linkedin_url: '',
    email: '',
    skillInput: '',
    skills: [] as string[],
    experienceText: '',
    experienceItems: [] as MediaItem[],
    achievementInput: '',
    achievementItems: [] as MediaItem[],
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

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();

    if (data) {
      const profileData = data as Profile;
      setProfile(profileData);

      const exp = parseExperience(profileData.experience);
      const ach = parseAchievements(profileData.achievements);

      setEditForm({
        username: profileData.username,
        college: profileData.college || '',
        github_url: profileData.github_url || '',
        linkedin_url: profileData.linkedin_url || '',
        email: (profileData as any).email || '',
        skillInput: '',
        skills: profileData.skills || [],
        experienceText: exp.text || '',
        experienceItems: exp.items || [],
        achievementInput: '',
        achievementItems: ach.items || [],
      });
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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


      const experiencePayload = JSON.stringify({ text: editForm.experienceText, items: expItems });
      const achievementsPayload = JSON.stringify({ list: [], items: achItems });

      // Build payload only with fields that exist in the fetched profile to avoid DB errors
      const updatePayload: any = {
        username: editForm.username,
        college: editForm.college,
        github_url: editForm.github_url,
        linkedin_url: editForm.linkedin_url,
        skills: editForm.skills,
      };

      if (Object.prototype.hasOwnProperty.call(profile, 'experience')) {
        updatePayload.experience = experiencePayload;
      }
      if (Object.prototype.hasOwnProperty.call(profile, 'achievements')) {
        updatePayload.achievements = achievementsPayload;
      }

      const { data: updateData, error } = await supabase.from('profiles').update(updatePayload).eq('id', id);

      if (error) {
        console.error('Profile update error', error);
        throw error;
      }

      toast.success('Profile updated!');
      setIsEditing(false);
      fetchProfile();
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

  if (!profile) return <div className="p-6 text-center">Loading...</div>;

  const isOwnProfile = user?.id === id;

  return (
    <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <aside className="col-span-1">
        <Card>
          <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
            <Avatar className="h-28 w-28">
              <AvatarFallback className="text-3xl">{profile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="w-full">
              {isEditing ? (
                <div className="w-full space-y-2">
                  <div>
                    <Label>Name</Label>
                    <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
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
                  <h4 className="text-sm font-medium">Contact</h4>
                  <div className="flex flex-col gap-2 mt-2">
                    {profile.email && (
                      <a className="flex items-center gap-2 text-sm" href={`mailto:${profile.email}`}>
                        <Mail className="h-4 w-4" /> {profile.email}
                      </a>
                    )}
                    {profile.github_url && (
                      <a className="flex items-center gap-2 text-sm" href={profile.github_url} target="_blank" rel="noreferrer">
                        <Github className="h-4 w-4" /> {profile.github_url}
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a className="flex items-center gap-2 text-sm" href={profile.linkedin_url} target="_blank" rel="noreferrer">
                        <Linkedin className="h-4 w-4" /> {profile.linkedin_url}
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
    </div>
  );
}