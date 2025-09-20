import { useState, useMemo } from 'react';
import { Trash2, RefreshCw, Search } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useIssues, type Issue } from '../../../contexts/IssueContext';
import { formatDistanceToNow } from 'date-fns';

type DeletedIssue = Issue & { deletedAt?: string };

export function DeletedIssues() {
  const { issues, updateIssue, deleteIssue } = useIssues();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get deleted issues (in a real app, you'd have a separate API endpoint for this)
  const deletedIssues = useMemo<DeletedIssue[]>(() => {
    // Since we're using mock data, we'll simulate deleted issues
    // In a real app, these would come from a backend API with soft-deleted records
    return [] as DeletedIssue[];
  }, [issues]);
  
  // Filter deleted issues
  const filteredIssues = useMemo(() => {
    return deletedIssues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [deletedIssues, searchQuery, categoryFilter]);

  const handleRestoreIssue = async (issueId: string) => {
    if (window.confirm('Are you sure you want to restore this issue?')) {
      setIsLoading(true);
      try {
        await updateIssue(issueId, { isDeleted: false });
        setSelectedIssues(prev => prev.filter(id => id !== issueId));
      } catch (error) {
        console.error('Error restoring issue:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePermanentDelete = async (issueId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this issue? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        deleteIssue(issueId, false); // Hard delete
        setSelectedIssues(prev => prev.filter(id => id !== issueId));
      } catch (error) {
        console.error('Error permanently deleting issue:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIssues.length === 0) return;
    
    if (window.confirm(`Are you sure you want to restore ${selectedIssues.length} issue(s)?`)) {
      setIsLoading(true);
      try {
        const promises = selectedIssues.map(issueId => updateIssue(issueId, { isDeleted: false }));
        await Promise.all(promises);
        setSelectedIssues([]);
      } catch (error) {
        console.error('Error restoring issues:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIssues.length === 0) return;
    
    if (window.confirm(`Are you sure you want to permanently delete ${selectedIssues.length} issue(s)? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        selectedIssues.forEach(issueId => deleteIssue(issueId, false));
        setSelectedIssues([]);
      } catch (error) {
        console.error('Error permanently deleting issues:', error);
      } finally {
        setIsLoading(false);
      }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deleted Issues</h1>
          <p className="text-gray-600">Manage soft-deleted issues - restore or permanently remove them</p>
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
                placeholder="Search deleted issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIssues.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-orange-900">
                {selectedIssues.length} issue{selectedIssues.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkRestore} className="bg-green-600 hover:bg-green-700">
                  Restore Selected
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleBulkPermanentDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Permanently Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedIssues([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deleted Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Deleted Issues ({filteredIssues.length})</span>
            {filteredIssues.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedIssues.length === filteredIssues.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deleted issues</h3>
              <p className="text-gray-500">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'No deleted issues match your current filters.'
                  : 'All deleted issues will appear here for review and restoration.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedIssues.length === filteredIssues.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Issue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Deleted</th>
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
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 capitalize">
                          {issue.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {issue.deletedAt 
                          ? formatDistanceToNow(new Date(issue.deletedAt), { addSuffix: true })
                          : 'Unknown'
                        }
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleRestoreIssue(issue.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Restore
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handlePermanentDelete(issue.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Forever
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
