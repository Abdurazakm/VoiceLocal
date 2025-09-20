import { useState } from 'react';
import { Search, Filter, SortDesc } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { IssueCard } from '../IssueCard';

interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  status: 'open' | 'resolved';
  upvotes: number;
  downvotes: number;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;
  author: string;
  createdAt: string;
}

interface IssuesFeedPageProps {
  onNavigate: (page: string) => void;
}

export function IssuesFeedPage({ onNavigate }: IssuesFeedPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for issues
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: '1',
      title: 'Pothole on Main Street needs immediate repair',
      description: 'There\'s a large pothole at the intersection of Main Street and Oak Avenue that\'s been growing larger after recent rains. It\'s causing damage to vehicles and is dangerous for cyclists.',
      location: 'Main Street & Oak Avenue',
      imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
      status: 'open',
      upvotes: 47,
      downvotes: 3,
      author: 'Sarah Johnson',
      createdAt: '2 days ago',
      comments: [
        {
          id: '1',
          author: 'Mike Chen',
          content: 'I\'ve also noticed this. My car hit it yesterday and it felt really rough.',
          createdAt: '1 day ago'
        },
        {
          id: '2',
          author: 'Lisa Brown',
          content: 'Has anyone contacted the city about this yet?',
          createdAt: '6 hours ago'
        }
      ]
    },
    {
      id: '2',
      title: 'Park playground equipment is damaged and unsafe',
      description: 'Several pieces of playground equipment at Riverside Park have broken or missing parts. The swing set has a broken chain and the slide has a sharp edge that could hurt children.',
      location: 'Riverside Park',
      status: 'open',
      upvotes: 32,
      downvotes: 1,
      author: 'David Wilson',
      createdAt: '3 days ago',
      comments: [
        {
          id: '3',
          author: 'Jennifer Lee',
          content: 'This is really concerning. I have young kids who play here.',
          createdAt: '2 days ago'
        }
      ]
    },
    {
      id: '3',
      title: 'Streetlight out on Elm Street - safety concern',
      description: 'The streetlight on Elm Street between 2nd and 3rd Avenue has been out for over a week. This area gets really dark at night and feels unsafe for pedestrians.',
      location: 'Elm Street (2nd-3rd Ave)',
      status: 'resolved',
      upvotes: 28,
      downvotes: 0,
      author: 'Robert Garcia',
      createdAt: '1 week ago',
      comments: [
        {
          id: '4',
          author: 'City Representative',
          content: 'Thank you for reporting this. The light has been repaired and should be working now.',
          createdAt: '2 days ago'
        }
      ]
    },
    {
      id: '4',
      title: 'Need more bike lanes on University Avenue',
      description: 'University Avenue is heavily used by cyclists but lacks proper bike lanes. This creates dangerous situations as bikes and cars share the narrow road.',
      location: 'University Avenue',
      status: 'open',
      upvotes: 56,
      downvotes: 12,
      author: 'Emily Rodriguez',
      createdAt: '5 days ago',
      comments: []
    }
  ]);

  const handleVote = (issueId: string, type: 'up' | 'down') => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          upvotes: type === 'up' ? issue.upvotes + 1 : issue.upvotes,
          downvotes: type === 'down' ? issue.downvotes + 1 : issue.downvotes,
        };
      }
      return issue;
    }));
  };

  const handleComment = (issueId: string, comment: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const newComment = {
          id: Date.now().toString(),
          author: 'Current User',
          content: comment,
          createdAt: 'Just now'
        };
        return {
          ...issue,
          comments: [...issue.comments, newComment]
        };
      }
      return issue;
    }));
  };

  // Filter and sort issues
  const filteredIssues = issues
    .filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.upvotes - a.upvotes;
        case 'comments':
          return b.comments.length - a.comments.length;
        default:
          return 0; // Keep original order for 'recent'
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Issues</h1>
          <p className="text-lg text-gray-600">
            Engage with local issues and help your community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SortDesc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="comments">Most Discussed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* New Issue Button */}
        <div className="mb-8">
          <Button
            onClick={() => onNavigate('post-issue')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Post New Issue
          </Button>
        </div>

        {/* Issues List */}
        <div className="space-y-6">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onVote={handleVote}
                onComment={handleComment}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No issues found matching your criteria.</p>
              <Button
                onClick={() => onNavigate('post-issue')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Be the first to post an issue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}