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
import { Github, Linkedin, X } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  college: string;
  skills: string[];
  github_url: string;
  linkedin_url: string;
}

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
    skillInput: '',
    skills: [] as string[],
  });

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setProfile(data);
      setEditForm({
        username: data.username,
        college: data.college || '',
        github_url: data.github_url || '',
        linkedin_url: data.linkedin_url || '',
        skillInput: '',
        skills: data.skills || [],
      });
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          college: editForm.college,
          github_url: editForm.github_url,
          linkedin_url: editForm.linkedin_url,
          skills: editForm.skills,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Profile updated!');
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const addSkill = () => {
    if (editForm.skillInput.trim() && !editForm.skills.includes(editForm.skillInput.trim())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, editForm.skillInput.trim()],
        skillInput: '',
      });
    }
  };

  const removeSkill = (skill: string) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(s => s !== skill),
    });
  };

  if (!profile) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const isOwnProfile = user?.id === id;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.username}</CardTitle>
                {profile.college && (
                  <p className="text-muted-foreground">{profile.college}</p>
                )}
              </div>
            </div>
            {isOwnProfile && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div>
                <Label>Username</Label>
                <Input
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>College</Label>
                <Input
                  value={editForm.college}
                  onChange={(e) =>
                    setEditForm({ ...editForm, college: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input
                  value={editForm.github_url}
                  onChange={(e) =>
                    setEditForm({ ...editForm, github_url: e.target.value })
                  }
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  value={editForm.linkedin_url}
                  onChange={(e) =>
                    setEditForm({ ...editForm, linkedin_url: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={editForm.skillInput}
                    onChange={(e) =>
                      setEditForm({ ...editForm, skillInput: e.target.value })
                    }
                    placeholder="Add a skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editForm.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}