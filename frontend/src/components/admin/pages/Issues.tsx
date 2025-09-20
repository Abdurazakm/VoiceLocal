import { useState, useMemo } from 'react';
import { Edit, Trash2, Eye, Search, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useIssues } from '../../../contexts/IssueContext';
import { formatDistanceToNow } from 'date-fns';

export function Issues() {
  const { issues, updateIssue, deleteIssue } = useIssues();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter and search issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [issues, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      await updateIssue(issueId, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating issue status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId: string, soft = true) => {
    if (window.confirm(`Are you sure you want to ${soft ? 'delete' : 'permanently delete'} this issue?`)) {
      setIsLoading(true);
      try {
        deleteIssue(issueId, soft);
        setSelectedIssues(prev => prev.filter(id => id !== issueId));
      } catch (error) {
        console.error('Error deleting issue:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIssues.length === 0) return;
    
    setIsLoading(true);
    try {
      const promises = selectedIssues.map(issueId => updateIssue(issueId, { status: status as any }));
      await Promise.all(promises);
      setSelectedIssues([]);
    } catch (error) {
      console.error('Error updating issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIssue = (issueId: string) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSelectAll = () => {
    setSelectedIssues(
      selectedIssues.length === filteredIssues.length 
        ? [] 
        : filteredIssues.map(issue => issue.id)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Management</h1>
          <p className="text-gray-600">Manage and moderate community issues</p>
        </div>
        <Button disabled={isLoading}>
          {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search issues by title, description, location, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
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
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
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
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIssues.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-900">
                {selectedIssues.length} issue{selectedIssues.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkStatusUpdate('in-progress')}>
                  Mark In Progress
                </Button>
                <Button size="sm" onClick={() => handleBulkStatusUpdate('resolved')}>
                  Mark Resolved
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('rejected')}>
                  Mark Rejected
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedIssues([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Issues ({filteredIssues.length})</span>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedIssues.length === filteredIssues.length ? 'Deselect All' : 'Select All'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Issue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Engagement</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIssues.includes(issue.id)}
                        onChange={() => handleSelectIssue(issue.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm truncate max-w-xs">
                          {issue.title}
                        </h3>
                        <p className="text-xs text-gray-500">{issue.location}</p>
                        <p className="text-xs text-gray-400">by {issue.author}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Select
                        value={issue.status}
                        onValueChange={(value) => handleStatusChange(issue.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-4">
                      {issue.priority && (
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {issue.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{issue.upvotes}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-600 font-medium">{issue.downvotes}</span>
                        <span className="text-gray-400 ml-2">{issue.comments.length} comments</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteIssue(issue.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredIssues.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No issues found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
