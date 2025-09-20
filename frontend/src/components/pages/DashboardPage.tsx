import { TrendingUp, Users, CheckCircle, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Breadcrumb } from '../ui/breadcrumb';

export function DashboardPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', isCurrentPage: true }
  ];
  const stats = [
    { title: 'Total Issues Raised', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Resolved Issues', value: '342', change: '+8%', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Total Votes Cast', value: '5,891', change: '+23%', icon: TrendingUp, color: 'text-purple-600' },
    { title: 'Community Comments', value: '2,156', change: '+15%', icon: MessageCircle, color: 'text-orange-600' },
  ];

  const topIssues = [
    {
      id: '1',
      title: 'Need more bike lanes on University Avenue',
      votes: 56,
      status: 'open',
      location: 'University Avenue',
      progress: 75
    },
    {
      id: '2',
      title: 'Pothole on Main Street needs immediate repair',
      votes: 47,
      status: 'open',
      location: 'Main Street & Oak Avenue',
      progress: 60
    },
    {
      id: '3',
      title: 'Park playground equipment is damaged and unsafe',
      votes: 32,
      status: 'in-progress',
      location: 'Riverside Park',
      progress: 40
    }
  ];

  const recentActivity = [
    { type: 'issue', text: 'New issue posted: "Traffic light timing needs adjustment"', time: '2 hours ago' },
    { type: 'resolved', text: 'Issue resolved: "Streetlight out on Elm Street"', time: '1 day ago' },
    { type: 'vote', text: '15 new votes on "Bike lanes on University Avenue"', time: '1 day ago' },
    { type: 'comment', text: 'City Representative commented on "Park playground equipment"', time: '2 days ago' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Dashboard</h1>
          <p className="text-lg text-gray-600">
            Track community engagement and issue progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 ${stat.color} bg-opacity-10 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Voted Issues */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Top 3 Voted Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topIssues.map((issue, index) => (
                  <div key={issue.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{issue.title}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          {issue.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{issue.votes}</p>
                        <p className="text-xs text-gray-500">votes</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Community Support</span>
                        <span>{issue.progress}%</span>
                      </div>
                      <Progress value={issue.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'issue' ? 'bg-blue-500' :
                      activity.type === 'resolved' ? 'bg-green-500' :
                      activity.type === 'vote' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resolution Rate */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Issue Resolution Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">27.4%</div>
                <div className="text-sm text-gray-600">Resolution Rate</div>
                <div className="text-xs text-green-600 mt-1">+5.2% from last month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">18</div>
                <div className="text-sm text-gray-600">Avg. Days to Resolve</div>
                <div className="text-xs text-green-600 mt-1">-3 days improvement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">4.7</div>
                <div className="text-sm text-gray-600">Community Satisfaction</div>
                <div className="text-xs text-gray-500 mt-1">out of 5.0</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}