import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Calendar,
  User,
  Edit3,
  Trash2,
  Flag,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  EmailShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  RedditShareButton,
  FacebookIcon,
  TwitterIcon,
  EmailIcon,
  LinkedinIcon,
  WhatsappIcon,
  RedditIcon
} from 'react-share';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Breadcrumb } from '../ui/breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { useIssues } from '../../contexts/IssueContext';
import { type Issue, type Comment } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import { commentSchema } from '../../utils/validation';
import { z } from 'zod';

export function IssueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, setRedirectAfterLogin } = useAuth();
  const { getIssue, voteOnIssue, addComment, updateComment, deleteComment } = useIssues();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commentError, setCommentError] = useState<string>('');
  const [showVoteHistory, setShowVoteHistory] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    if (id) {
      const foundIssue = getIssue(id);
      setIssue(foundIssue || null);
    }
  }, [id, getIssue]);

  const handleVote = (type: 'up' | 'down') => {
    if (!isAuthenticated) {
      setRedirectAfterLogin(`/issue/${id}`);
      navigate('/login');
      return;
    }

    if (!issue || !user) return;

    voteOnIssue(issue.id, user.id, type);
    
    // Update local state to reflect changes immediately
    const currentVote = issue.userVotes[user.id];
    let newUpvotes = issue.upvotes;
    let newDownvotes = issue.downvotes;
    const newUserVotes = { ...issue.userVotes };

    // Remove previous vote if exists
    if (currentVote === 'up') {
      newUpvotes--;
    } else if (currentVote === 'down') {
      newDownvotes--;
    }

    // Add new vote if different from current
    if (currentVote !== type) {
      newUserVotes[user.id] = type;
      if (type === 'up') {
        newUpvotes++;
      } else {
        newDownvotes++;
      }
    } else {
      // Remove vote if clicking same vote type
      delete newUserVotes[user.id];
    }

    setIssue(prev => prev ? {
      ...prev,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      userVotes: newUserVotes
    } : null);
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      setRedirectAfterLogin(`/issue/${id}`);
      navigate('/login');
      return;
    }

    if (!issue || !user) return;

    // Validate comment
    try {
      commentSchema.parse({ content: newComment });
      setCommentError('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setCommentError(error.issues[0].message);
        return;
      }
    }

    setIsLoading(true);
    try {
      await addComment(issue.id, {
        author: `${user.firstName} ${user.lastName}`,
        authorId: user.id,
        content: newComment
      });

      // Update local state
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: `${user.firstName} ${user.lastName}`,
        authorId: user.id,
        content: newComment,
        createdAt: new Date().toISOString()
      };

      setIssue(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newCommentObj]
      } : null);

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditCommentText(currentContent);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editCommentText.trim() || !issue) return;

    setIsLoading(true);
    try {
      await updateComment(issue.id, commentId, editCommentText);

      // Update local state
      setIssue(prev => prev ? {
        ...prev,
        comments: prev.comments.map(comment =>
          comment.id === commentId
            ? { ...comment, content: editCommentText, updatedAt: new Date().toISOString() }
            : comment
        )
      } : null);

      setEditingComment(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!issue || !window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(issue.id, commentId);

      // Update local state
      setIssue(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(comment => comment.id !== commentId)
      } : null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      trackShare('copy');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const trackShare = (platform: string) => {
    setShareAnalytics(prev => ({
      ...prev,
      [platform]: (prev[platform] || 0) + 1
    }));
    // In a real app, this would send analytics to your backend
    console.log(`Shared on ${platform}`);
  };

  const generateShareMessage = (platform: string) => {
    const baseMessage = `Check out this community issue: "${issue?.title}"`;
    const location = issue?.location ? ` in ${issue.location}` : '';
    const priority = issue?.priority ? ` (${issue.priority} priority)` : '';
    const url = ` ${window.location.href}`;
    
    switch (platform) {
      case 'twitter':
        return `🚨 ${baseMessage}${location}${priority} Help bring attention to this issue!${url} #CommunityIssues #LocalNews`;
      case 'facebook':
        return `${baseMessage}${location}${priority}\n\nYour voice can make a difference in our community. Check out this issue and help spread awareness!${url}`;
      case 'linkedin':
        return `Community Issue Alert: ${issue?.title}${location}${priority}\n\nEngaged citizens are the backbone of thriving communities. This issue needs our attention.${url}`;
      case 'whatsapp':
        return `Hi! I found this important community issue that might interest you: "${issue?.title}"${location}${priority}${url}`;
      case 'reddit':
        return `${baseMessage}${location}${priority}`;
      default:
        return `${baseMessage}${location}${priority}${url}`;
    }
  };

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-5 w-5" />;
      case 'in-progress': return <Clock className="h-5 w-5" />;
      case 'resolved': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <Flag className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h2>
          <p className="text-gray-600 mb-4">The issue you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/issues')}>Back to Issues</Button>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareTitle = issue.title;

  const userVote = user ? issue.userVotes[user.id] : null;

  // Get vote statistics
  const totalVotes = issue.upvotes + issue.downvotes;
  const votePercentage = totalVotes > 0 ? Math.round((issue.upvotes / totalVotes) * 100) : 0;
  const uniqueVoters = Object.keys(issue.userVotes).length;

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: 'Issues', href: '/issues' },
    { label: issue.title, isCurrentPage: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Back Button - Mobile friendly */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Issue Details */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className={`${getStatusColor(issue.status)} flex items-center`}>
                    {getStatusIcon(issue.status)}
                    <span className="ml-1 capitalize">{issue.status}</span>
                  </Badge>
                  {issue.priority && (
                    <Badge variant="outline" className={
                      issue.priority === 'high' ? 'border-red-200 text-red-700' :
                      issue.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                      'border-green-200 text-green-700'
                    }>
                      {issue.priority} priority
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                  {issue.title}
                </CardTitle>
                
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {issue.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {issue.location}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                {user && user.id === issue.authorId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/issue/${issue.id}/edit`)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
                      <div className="p-4 space-y-4">
                        <div className="text-sm font-medium text-gray-900 border-b pb-2">
                          Share this issue
                        </div>
                        
                        {/* Social Media Icons */}
                        <div className="grid grid-cols-3 gap-2">
                          <FacebookShareButton 
                            url={shareUrl} 
                            beforeOnClick={() => trackShare('facebook')}
                            className="flex justify-center"
                          >
                            <FacebookIcon size={36} round />
                          </FacebookShareButton>
                          
                          <TwitterShareButton 
                            url={shareUrl} 
                            title={generateShareMessage('twitter')}
                            beforeOnClick={() => trackShare('twitter')}
                            className="flex justify-center"
                          >
                            <TwitterIcon size={36} round />
                          </TwitterShareButton>
                          
                          <LinkedinShareButton
                            url={shareUrl}
                            title={issue.title}
                            summary={generateShareMessage('linkedin')}
                            beforeOnClick={() => trackShare('linkedin')}
                            className="flex justify-center"
                          >
                            <LinkedinIcon size={36} round />
                          </LinkedinShareButton>
                          
                          <WhatsappShareButton
                            url={shareUrl}
                            title={generateShareMessage('whatsapp')}
                            beforeOnClick={() => trackShare('whatsapp')}
                            className="flex justify-center"
                          >
                            <WhatsappIcon size={36} round />
                          </WhatsappShareButton>
                          
                          <RedditShareButton
                            url={shareUrl}
                            title={generateShareMessage('reddit')}
                            beforeOnClick={() => trackShare('reddit')}
                            className="flex justify-center"
                          >
                            <RedditIcon size={36} round />
                          </RedditShareButton>
                          
                          <EmailShareButton 
                            url={shareUrl} 
                            subject={`Community Issue: ${shareTitle}`} 
                            body={generateShareMessage('email')}
                            beforeOnClick={() => trackShare('email')}
                            className="flex justify-center"
                          >
                            <EmailIcon size={36} round />
                          </EmailShareButton>
                        </div>
                        
                        {/* Copy Link Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyLink}
                          className="w-full justify-start bg-gray-50 hover:bg-gray-100"
                        >
                          {copied ? '✓ Copied!' : '📋 Copy Link'}
                        </Button>
                        
                        {/* Share Analytics */}
                        {Object.keys(shareAnalytics).length > 0 && (
                          <div className="text-xs text-gray-500 border-t pt-2">
                            <div className="font-medium mb-1">Share Stats:</div>
                            {Object.entries(shareAnalytics).map(([platform, count]) => (
                              <div key={platform} className="flex justify-between">
                                <span className="capitalize">{platform}:</span>
                                <span>{count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed">{issue.description}</p>
            </div>
            
            {issue.imageUrl && (
              <div className="mb-6">
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            
            {/* Voting and Engagement */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center space-x-1">
                  <Button
                    variant={userVote === 'up' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleVote('up')}
                    className={userVote === 'up' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {issue.upvotes}
                  </Button>
                  <Button
                    variant={userVote === 'down' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleVote('down')}
                    className={userVote === 'down' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {issue.downvotes}
                  </Button>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {issue.comments.length} comments
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVoteHistory(!showVoteHistory)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Vote Stats
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                {issue.updatedAt && (
                  <span>Updated {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}</span>
                )}
              </div>
            </div>

            {/* Vote History/Stats */}
            {showVoteHistory && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Voting Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{issue.upvotes}</div>
                    <div className="text-xs text-gray-600">Upvotes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{issue.downvotes}</div>
                    <div className="text-xs text-gray-600">Downvotes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{votePercentage}%</div>
                    <div className="text-xs text-gray-600">Support Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{uniqueVoters}</div>
                    <div className="text-xs text-gray-600">Total Voters</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Comments ({issue.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            <div className="mb-6">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add your comment..."
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      if (commentError) setCommentError('');
                    }}
                    rows={3}
                    className={commentError ? 'border-red-500' : ''}
                  />
                  {commentError && (
                    <p className="text-sm text-red-600">{commentError}</p>
                  )}
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">You must be logged in to comment</p>
                  <Button
                    onClick={() => {
                      setRedirectAfterLogin(`/issue/${id}`);
                      navigate('/login');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Login to Comment
                  </Button>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {issue.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                issue.comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{comment.author}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
                          </p>
                        </div>
                      </div>
                      
                      {user && user.id === comment.authorId && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditComment(comment.id, comment.content)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={!editCommentText.trim() || isLoading}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingComment(null);
                              setEditCommentText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700">{comment.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}
