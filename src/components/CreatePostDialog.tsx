import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ImagePlus, X, Tag } from 'lucide-react';

const POST_TAGS = ['Technical', 'Cultural', 'Academic', 'Social', 'Sports', 'Other'];

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    setImages([...images, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('post-images').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error('Failed to upload image');
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error('Please add some content or images');
      return;
    }

    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    if (!user) {
      toast.error('You must be signed in to create a post');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Create post
      const { error } = await supabase.from('posts' as any).insert({
        user_id: user.id,
        content: content.trim(),
        images: imageUrls,
        tags: selectedTags,
      });

      if (error) throw error;

      toast.success('Post created successfully! 🎉');
      setContent('');
      setImages([]);
      setPreviews([]);
      setSelectedTags([]);
      onOpenChange(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Post</DialogTitle>
          <DialogDescription>
            Share your experiences, opinions, or updates with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, experiences, or updates..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] mt-2 resize-none"
            />
          </div>

          <div>
            <Label>Images (max 4)</Label>
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl border-2 border-border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {images.length < 4 && (
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all mt-2">
                <div className="flex flex-col items-center gap-2">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload images
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            )}
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4" />
              Tags (Select at least one)
            </Label>
            <div className="flex flex-wrap gap-2">
              {POST_TAGS.map((tag) => (
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
                Select tags to categorize your post
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
