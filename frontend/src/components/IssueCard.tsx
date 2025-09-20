import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Edit3, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  status: 'open' | 'resolved';
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  author: string;
  createdAt: string;
}

interface Comment {
  id: string;
  author: string;
  authorId?: string;
  content: string;
  createdAt: string;
}

interface IssueCardProps {
  issue: Issue;
  onVote: (issueId: string, type: 'up' | 'down') => void;
  onComment: (issueId: string, comment: string) => void;
  onEditComment?: (issueId: string, commentId: string, content: string) => void;
  onDeleteComment?: (issueId: string, commentId: string) => void;
  onNavigate?: (page: string) => void;
}

export function IssueCard({ issue, onVote, onComment, onEditComment, onDeleteComment, onNavigate }: IssueCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const { user, isAuthenticated, setRedirectAfterLogin } = useAuth();

  const handleComment = () => {
    if (!isAuthenticated && onNavigate) {
      setRedirectAfterLogin('issues-feed');
      onNavigate('login');
      return;
    }
    
    if (newComment.trim()) {
      onComment(issue.id, newComment);
      setNewComment('');
    }
  };

  const handleShowComments = () => {
    if (!isAuthenticated && onNavigate) {
      setRedirectAfterLogin('issues-feed');
      onNavigate('login');
      return;
    }
    setShowComments(!showComments);
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditCommentText(currentContent);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editCommentText.trim() || !onEditComment) return;
    
    onEditComment(issue.id, commentId, editCommentText);
    setEditingComment(null);
    setEditCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!onDeleteComment || !window.confirm('Are you sure you want to delete this comment?')) return;
    
    onDeleteComment(issue.id, commentId);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <Badge variant={issue.status === 'open' ? 'default' : 'secondary'}>
              {issue.status}
            </Badge>
            <span className="text-sm text-gray-500">by {issue.author}</span>
          </div>
          <span className="text-sm text-gray-500">{issue.createdAt}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          {issue.location}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 mb-4">{issue.description}</p>
        {issue.imageUrl && (
          <div className="mb-4">
            <ImageWithFallback
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        {/* Voting and Comments Actions */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(issue.id, 'up')}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {issue.upvotes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(issue.id, 'down')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {issue.downvotes}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowComments}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {issue.comments.length} Comments
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Engage
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full space-y-4">
            <div className="space-y-3">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {typeof comment.createdAt === 'string' && comment.createdAt.includes('T') 
                          ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                          : comment.createdAt
                        }
                      </span>
                    </div>
                    
                    {user && comment.authorId && user.id === comment.authorId && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditComment(comment.id, comment.content)}
                          className="text-gray-600 hover:text-gray-900 p-1 h-6 w-6"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-700 p-1 h-6 w-6"
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
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={!editCommentText.trim()}
                          className="h-7 text-xs"
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
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Post Comment
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-3">You must be logged in to comment</p>
                  <Button
                    onClick={() => {
                      if (onNavigate) {
                        setRedirectAfterLogin('issues-feed');
                        onNavigate('login');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Login to Comment
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}