import { Table } from '../Table';
import { Button } from '../Button';
import { Badge } from '../Badge';

export function Users() {
  // Mock data - replace with real API call
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'User', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', role: 'User', joined: '2024-01-10' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', role: 'User', joined: '2024-01-05' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Suspended', role: 'User', joined: '2024-01-01' },
  ];

  const handleStatusChange = (userId: number, newStatus: string) => {
    console.log(`Changing user ${userId} status to ${newStatus}`);
    // Add API call here
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { 
      key: 'status', 
      header: 'Status',
      render: (status: string) => <Badge status={status} type="user" />
    },
    { key: 'joined', header: 'Joined' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          {row.status === 'Active' ? (
            <Button 
              size="sm" 
              variant="danger"
              onClick={() => handleStatusChange(row.id, 'Suspended')}
            >
              Suspend
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => handleStatusChange(row.id, 'Active')}
            >
              Activate
            </Button>
          )}
          <Button size="sm" variant="secondary">
            Edit
          </Button>
        </div>
      )
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage platform users</p>
          </div>
          <Button>Add User</Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <Table columns={columns} data={users} />
    </div>
  );
}
