import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit3, Trash2, MapPin, Calendar, Mail, Plus, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { useIssues } from '../../contexts/IssueContext';
import { type Issue } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface EditProfileData {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  bio: string;
}

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { getUserIssues, deleteIssue } = useIssues();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [editData, setEditData] = useState<EditProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user issues and profile data
  useEffect(() => {
    if (user) {
      const issues = getUserIssues(user.id);
      setUserIssues(issues);
      
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [user, getUserIssues]);

  const handleEditProfile = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        location: user.location || '',
        bio: user.bio || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await updateProfile({
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        location: editData.location,
        bio: editData.bio,
        username: editData.email.split('@')[0] // Update username based on email
      });

      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIssue = (issueId: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      deleteIssue(issueId, true); // Soft delete
      setUserIssues(prev => prev.filter(issue => issue.id !== issueId));
    }
  };

  const handleEditIssue = (issueId: string) => {
    navigate(`/issue/${issueId}/edit`);
  };

  const handleViewIssue = (issueId: string) => {
    navigate(`/issue/${issueId}`);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You must be logged in to view this page.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your community contributions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditProfile}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editData.firstName}
                          onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editData.lastName}
                          onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Email address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editData.location}
                        onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, State"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-gray-600">@{user.username}</p>
                    </div>

                    {user.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Bio</h4>
                        <p className="text-gray-600 text-sm">{user.bio}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.email}
                      </div>
                      {user.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {user.location}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Issues */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Issues ({userIssues.length})</CardTitle>
                  <Button
                    onClick={() => navigate('/post-issue')}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Issue
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't posted any issues yet.</p>
                    <Button
                      onClick={() => navigate('/post-issue')}
                      className="flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Issue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getStatusColor(issue.status)}>
                                {issue.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            
                            <h4 className="font-medium text-gray-900 mb-1">
                              {issue.title}
                            </h4>
                            
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {issue.description}
                            </p>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {issue.location}
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span>↑ {issue.upvotes} votes</span>
                              <span>💬 {issue.comments.length} comments</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewIssue(issue.id)}
                              title="View Issue"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditIssue(issue.id)}
                              title="Edit Issue"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIssue(issue.id)}
                              title="Delete Issue"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
