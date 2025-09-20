import { ArrowRight, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const stats = [
    { title: 'Total Issues', value: '1,247', icon: Users, color: 'text-blue-600' },
    { title: 'Top Voted', value: '89', icon: TrendingUp, color: 'text-green-600' },
    { title: 'Resolved Issues', value: '342', icon: CheckCircle, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Raise and Vote on Local Issues
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Empower your community by giving issues a digital voice. 
                Connect with neighbors, share concerns, and create positive change together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => onNavigate('post-issue')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                >
                  Post an Issue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => onNavigate('issues-feed')}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
                >
                  View Issues
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1722643882339-7a6c9cb080db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBtZWV0aW5nJTIwbG9jYWwlMjBnb3Zlcm5tZW50fGVufDF8fHx8MTc1ODM4MDEwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Community meeting"
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
              </div>
              
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-60 z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-200 rounded-full opacity-60 z-0"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Status Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Impact</h2>
          <p className="text-lg text-gray-600">See how our community is making a difference</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className={`mx-auto w-12 h-12 ${stat.color} bg-opacity-10 rounded-full flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Make a Difference?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of community members who are already using VoiceLocal to create positive change in their neighborhoods.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => onNavigate('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Get Started
              </Button>
              <Button
                onClick={() => onNavigate('about')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}