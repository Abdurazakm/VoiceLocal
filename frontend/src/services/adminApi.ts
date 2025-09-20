// Basic API service for admin operations
// Replace with actual API endpoints when backend is ready

const API_BASE_URL = '/api/admin';

// Generic fetch wrapper
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      // Add auth headers here
      // 'Authorization': `Bearer ${getAuthToken()}`
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// User Management API
export const userApi = {
  // GET /api/admin/users - Fetch all users
  getUsers: async (params?: { page?: number; status?: string; role?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiCall(`/users${queryString}`);
  },

  // GET /api/admin/users/{id} - Get user details
  getUserById: async (id: number) => {
    return apiCall(`/users/${id}`);
  },

  // PATCH /api/admin/users/{id} - Update user status
  updateUser: async (id: number, data: { name?: string; role?: string; status?: string }) => {
    return apiCall(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // POST /api/admin/users/{id}/suspend - Suspend user
  suspendUser: async (id: number, reason?: string) => {
    return apiCall(`/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Issue Management API
export const issueApi = {
  // GET /api/admin/issues - Fetch all issues
  getIssues: async (params?: { page?: number; status?: string; category?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiCall(`/issues${queryString}`);
  },

  // GET /api/admin/issues/{id} - Get issue details
  getIssueById: async (id: number) => {
    return apiCall(`/issues/${id}`);
  },

  // PATCH /api/admin/issues/{id} - Update issue
  updateIssue: async (id: number, data: { title?: string; description?: string; status?: string; category?: string }) => {
    return apiCall(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE /api/admin/issues/{id} - Delete issue
  deleteIssue: async (id: number) => {
    return apiCall(`/issues/${id}`, {
      method: 'DELETE',
    });
  },

  // POST /api/admin/issues/{id}/verify - Verify issue
  verifyIssue: async (id: number, verified: boolean = true) => {
    return apiCall(`/issues/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verified }),
    });
  },
};

// Category Management API
export const categoryApi = {
  // GET /api/admin/categories - Fetch all categories
  getCategories: async () => {
    return apiCall('/categories');
  },

  // POST /api/admin/categories - Create new category
  createCategory: async (data: { name: string; description?: string; color?: string }) => {
    return apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PATCH /api/admin/categories/{id} - Update category
  updateCategory: async (id: number, data: { name?: string; description?: string; color?: string }) => {
    return apiCall(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE /api/admin/categories/{id} - Delete category
  deleteCategory: async (id: number) => {
    return apiCall(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Analytics API
export const analyticsApi = {
  // GET /api/admin/analytics - Get dashboard analytics
  getDashboardStats: async () => {
    return apiCall('/analytics');
  },

  // GET /api/admin/analytics/reports - Get detailed reports
  getReports: async (params?: { from?: string; to?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/analytics/reports${queryString}`);
  },
};

// Settings API
export const settingsApi = {
  // GET /api/admin/settings - Get platform settings
  getSettings: async () => {
    return apiCall('/settings');
  },

  // PUT /api/admin/settings - Update platform settings
  updateSettings: async (settings: Record<string, any>) => {
    return apiCall('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// Export all APIs
export default {
  users: userApi,
  issues: issueApi,
  categories: categoryApi,
  analytics: analyticsApi,
  settings: settingsApi,
};
