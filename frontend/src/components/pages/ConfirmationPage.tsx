import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ConfirmationPageProps {
  onNavigate: (page: string) => void;
}

export function ConfirmationPage({ onNavigate }: ConfirmationPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Your issue has been submitted!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Thank you for helping make your community better. Your issue is now live and community members can vote and comment on it.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => onNavigate('issues-feed')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Your Issue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => onNavigate('home')}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="mt-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">1</span>
              </div>
              <p className="text-left">Community members will see your issue and can vote or comment</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">2</span>
              </div>
              <p className="text-left">Local officials and representatives will be notified about popular issues</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">3</span>
              </div>
              <p className="text-left">You'll receive updates when your issue gets attention or is resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}