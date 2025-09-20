import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SortDesc, Plus, Grid, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { IssueCard } from '../IssueCard';
import { Breadcrumb } from '../ui/breadcrumb';
import { useIssues } from '../../contexts/IssueContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

export function IssuesFeedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { issues, voteOnIssue, addComment, updateComment, deleteComment } = useIssues();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: 'Issues', isCurrentPage: true }
  ];

  const handleVote = (issueId: string, type: 'up' | 'down') => {
    if (!user) return;
    voteOnIssue(issueId, user.id, type);
  };

  const handleComment = (issueId: string, comment: string) => {
    if (!user) return;
    addComment(issueId, {
      author: `${user.firstName} ${user.lastName}`,
      authorId: user.id,
      content: comment
    });
  };

  const handleEditComment = (issueId: string, commentId: string, content: string) => {
    updateComment(issueId, commentId, content);
  };

  const handleDeleteComment = (issueId: string, commentId: string) => {
    deleteComment(issueId, commentId);
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  const handleIssueClick = (issueId: string) => {
    navigate(`/issue/${issueId}`);
  };

  // Filter, sort, and paginate issues
  const { filteredAndSortedIssues, totalPages } = useMemo(() => {
    const filtered = issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });

    // Sort issues
    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'comments':
          return b.comments.length - a.comments.length;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    // Paginate
    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedIssues = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { filteredAndSortedIssues: paginatedIssues, totalPages };
  }, [issues, searchQuery, filterStatus, filterCategory, filterPriority, sortBy, currentPage]);

  // Reset page when filters change
  const resetPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Reset page when search or filters change
  useEffect(() => {
    resetPage();
  }, [searchQuery, filterStatus, filterCategory, filterPriority]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Issues</h1>
            <p className="text-lg text-gray-600">
              Engage with local issues and help your community
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => navigate('/post-issue')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post New Issue
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search issues by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="parks">Parks</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SortDesc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="comments">Most Discussed</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedIssues.length} of {issues.length} issues
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8' : 'space-y-6 mb-8'}>
          {filteredAndSortedIssues.length > 0 ? (
            filteredAndSortedIssues.map((issue) => (
              <div key={issue.id} onClick={() => handleIssueClick(issue.id)} className="cursor-pointer">
                <IssueCard
                  issue={{
                    id: issue.id,
                    title: issue.title,
                    description: issue.description,
                    location: issue.location,
                    imageUrl: issue.imageUrl,
                    status: issue.status as 'open' | 'resolved',
                    upvotes: issue.upvotes,
                    downvotes: issue.downvotes,
                    comments: issue.comments,
                    author: issue.author,
                    createdAt: new Date(issue.createdAt).toLocaleDateString()
                  }}
                  onVote={handleVote}
                  onComment={handleComment}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                  onNavigate={handleNavigate}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No issues found matching your criteria.</p>
              <Button
                onClick={() => navigate('/post-issue')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Be the first to post an issue
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}