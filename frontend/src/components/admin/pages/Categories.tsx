import { useState } from 'react';
import { Table } from '../Table';
import { Button } from '../Button';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function Categories() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // Mock data - replace with real API call
  const categories = [
    { id: 1, name: 'Infrastructure', description: 'Roads, bridges, utilities', issueCount: 45, color: '#3B82F6' },
    { id: 2, name: 'Maintenance', description: 'General maintenance issues', issueCount: 23, color: '#10B981' },
    { id: 3, name: 'Safety', description: 'Safety and security concerns', issueCount: 12, color: '#EF4444' },
    { id: 4, name: 'Environment', description: 'Environmental issues', issueCount: 8, color: '#8B5CF6' },
  ];

  const handleAddCategory = () => {
    console.log('Adding category:', newCategory);
    // Add API call here
    setNewCategory({ name: '', description: '' });
    setShowAddForm(false);
  };

  const handleDeleteCategory = (categoryId: number) => {
    console.log(`Deleting category ${categoryId}`);
    // Add API call here
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Name',
      render: (name: string, row: any) => (
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: row.color }}
          ></div>
          <span className="font-medium">{name}</span>
        </div>
      )
    },
    { key: 'description', header: 'Description' },
    { 
      key: 'issueCount', 
      header: 'Issues',
      render: (count: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {count}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="secondary">
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => handleDeleteCategory(row.id)}
          >
            <Trash2 className="w-4 h-4" />
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
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage issue categories</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <Table columns={columns} data={categories} />
    </div>
  );
}
