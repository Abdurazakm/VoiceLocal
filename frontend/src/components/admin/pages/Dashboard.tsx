import { TrendingUp, Users, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { useIssues } from '../../../contexts/IssueContext';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { issues } = useIssues();
  
  // Calculate real statistics
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
  const openIssues = issues.filter(issue => issue.status === 'open').length;
  const inProgressIssues = issues.filter(issue => issue.status === 'in-progress').length;
  const totalVotes = issues.reduce((sum, issue) => sum + issue.upvotes + issue.downvotes, 0);
  const totalComments = issues.reduce((sum, issue) => sum + issue.comments.length, 0);
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
  
  // Get recent issues (last 5)
  const recentIssues = issues
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Get trending issues (most voted)
  const trendingIssues = issues
    .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    .slice(0, 5);
  
  const stats = [
    { 
      label: 'Total Issues', 
      value: totalIssues.toString(), 
      change: '+5%', 
      icon: FileText,
      color: 'text-blue-600'
    },
    { 
      label: 'Resolved Issues', 
      value: resolvedIssues.toString(), 
      change: '+8%', 
      icon: CheckCircle,
      color: 'text-green-600'
    },
    { 
      label: 'Open Issues', 
      value: openIssues.toString(), 
      change: '-3%', 
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    { 
      label: 'In Progress', 
      value: inProgressIssues.toString(), 
      change: '+12%', 
      icon: Clock,
      color: 'text-yellow-600'
    },
    { 
      label: 'Total Votes', 
      value: totalVotes.toString(), 
      change: '+15%', 
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    { 
      label: 'Total Comments', 
      value: totalComments.toString(), 
      change: '+7%', 
      icon: Users,
      color: 'text-indigo-600'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your VoiceLocal platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2 ${stat.color} bg-opacity-10 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className={`mt-2 text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Platform Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{resolutionRate}%</div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalIssues > 0 ? Math.round(totalVotes / totalIssues) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Votes per Issue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {totalIssues > 0 ? Math.round(totalComments / totalIssues) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Comments per Issue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIssues.length > 0 ? recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-gray-400">{issue.location}</p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      issue.status === 'resolved' 
                        ? 'bg-green-100 text-green-800'
                        : issue.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : issue.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No recent issues</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trending Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingIssues.length > 0 ? trendingIssues.map((issue, index) => (
                <div key={issue.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-bold text-gray-600 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                      <p className="text-xs text-gray-400">{issue.location}</p>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-bold text-blue-600">
                      {issue.upvotes - issue.downvotes}
                    </p>
                    <p className="text-xs text-gray-500">net votes</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No trending issues</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
