interface BadgeProps {
  status: string;
  type?: 'user' | 'issue';
}

export function Badge({ status, type = 'user' }: BadgeProps) {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'user') {
      switch (status.toLowerCase()) {
        case 'active':
          return 'bg-green-100 text-green-800';
        case 'inactive':
          return 'bg-gray-100 text-gray-800';
        case 'suspended':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status.toLowerCase()) {
        case 'verified':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'resolved':
          return 'bg-blue-100 text-blue-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status, type)}`}>
      {status}
    </span>
  );
}
