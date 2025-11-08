import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const popularSkills = [
    'React', 'Python', 'JavaScript', 'TypeScript', 'Node.js',
    'Machine Learning', 'UI/UX Design', 'Figma', 'SQL', 'Git'
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">Find projects and teammates by skills</p>
      </div>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search by skills, interests, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Popular Skills</h2>
        <div className="flex flex-wrap gap-2">
          {popularSkills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSearchQuery(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {searchQuery && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Search functionality coming soon! Use the Home page to browse all projects.
          </CardContent>
        </Card>
      )}
    </div>
  );
}