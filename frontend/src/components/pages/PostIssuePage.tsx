import { useState, useEffect } from 'react';
import { Upload, MapPin, FileText, Type } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { useIssues } from '../../contexts/IssueContext';
import { useNavigate } from 'react-router-dom';

export function PostIssuePage() {
  const { isAuthenticated, setRedirectAfterLogin, user } = useAuth();
  const { addIssue } = useIssues();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setRedirectAfterLogin('post-issue');
      navigate('/login');
    }
  }, [isAuthenticated, setRedirectAfterLogin, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double-check authentication before submitting
    if (!isAuthenticated) {
      setRedirectAfterLogin('post-issue');
      navigate('/login');
      return;
    }
    
    if (formData.title && formData.description && formData.location && user) {
      addIssue({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
        status: 'open',
        author: `${user.firstName} ${user.lastName}`,
        authorId: user.id,
        category: 'infrastructure',
        priority: 'medium'
      });
      navigate('/confirmation');
    }
  };

  const isFormValid = formData.title && formData.description && formData.location;

  // Show loading or nothing while redirecting to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post a New Issue</h1>
          <p className="text-lg text-gray-600">
            Help your community by sharing an issue that needs attention
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Issue Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center">
                  <Type className="h-4 w-4 mr-2" />
                  Issue Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a clear, descriptive title for your issue"
                  className="w-full"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location *
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Street & 1st Avenue, Downtown Park"
                  className="w-full"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about the issue, including when it started, how it affects the community, and any other relevant details..."
                  className="w-full min-h-32 resize-none"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="image" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">
                            Click to upload
                          </span>
                          <span className="text-gray-500"> or drag and drop</span>
                        </Label>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  Submit Issue
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Posting Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Be specific and descriptive in your title and description</li>
              <li>• Include the exact location where the issue is occurring</li>
              <li>• Add photos when possible to help illustrate the problem</li>
              <li>• Be respectful and constructive in your language</li>
              <li>• Check if a similar issue has already been posted</li>
              <li>• Focus on community issues that can be addressed locally</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}