import { Users, MessageCircle, Vote, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';

export function AboutPage() {
  const navigate = useNavigate();
  const features = [
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Connect with neighbors and local community members who care about the same issues you do.'
    },
    {
      icon: MessageCircle,
      title: 'Open Discussion',
      description: 'Share your thoughts, comment on issues, and engage in meaningful conversations about local matters.'
    },
    {
      icon: Vote,
      title: 'Democratic Voting',
      description: 'Vote on issues that matter to you and help prioritize what needs attention in your community.'
    },
    {
      icon: CheckCircle,
      title: 'Track Progress',
      description: 'See real results as issues get resolved and track the positive impact on your neighborhood.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Community Manager',
      bio: 'Passionate about local governance and community engagement.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      role: 'Tech Lead',
      bio: 'Building technology solutions for civic engagement.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      bio: 'Creating intuitive experiences for community participation.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About VoiceLocal
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We believe that every community member should have a voice in shaping their neighborhood. 
              VoiceLocal makes it easy to raise concerns, engage in discussions, and create positive change together.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              To empower communities by providing a digital platform where local issues can be raised, 
              discussed, and resolved through collective action and civic engagement.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              We bridge the gap between community members and local government, making it easier for 
              everyone to participate in creating positive change in their neighborhoods.
            </p>
            <Button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Join Our Community
            </Button>
          </div>
          <div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop"
              alt="Community collaboration"
              className="w-full h-80 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How VoiceLocal Works</h2>
            <p className="text-lg text-gray-600">
              Our platform makes community engagement simple and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600">
              Real numbers showing how VoiceLocal is making a difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,247</div>
              <div className="text-gray-600">Issues Raised</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">342</div>
              <div className="text-gray-600">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">5,891</div>
              <div className="text-gray-600">Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">12</div>
              <div className="text-gray-600">Cities Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">
              Dedicated individuals working to strengthen communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of community members who are already using VoiceLocal to create positive change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Get Started Today
            </Button>
            <Button
              onClick={() => navigate('/post-issue')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3"
            >
              Post Your First Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}