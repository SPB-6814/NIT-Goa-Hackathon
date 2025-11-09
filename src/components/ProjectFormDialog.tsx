import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PROJECT_TAGS = ['Technical', 'Cultural', 'Academic', 'Social', 'Sports', 'Other'];

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectFormDialog = ({ open, onOpenChange }: ProjectFormDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          skills_needed: skills,
          tags: selectedTags,
          owner_id: user.id,
        });

      if (error) throw error;

      toast.success('Project created successfully!');
      setTitle('');
      setDescription('');
      setSkills([]);
      setSelectedTags([]);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter project title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe your project..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills Needed</Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., React, Python"
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
              {skills.map((skill) => (
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

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4" />
              Project Tags (Select at least one)
            </Label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Select tags to categorize your project
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};