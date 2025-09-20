import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'rejected';
  upvotes: number;
  downvotes: number;
  userVotes: { [userId: string]: 'up' | 'down' }; // Track individual user votes
  comments: Comment[];
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface IssueContextType {
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'userVotes' | 'comments'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string, soft?: boolean) => void;
  getIssue: (id: string) => Issue | undefined;
  getUserIssues: (userId: string) => Issue[];
  voteOnIssue: (issueId: string, userId: string, type: 'up' | 'down') => void;
  addComment: (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  updateComment: (issueId: string, commentId: string, content: string) => void;
  deleteComment: (issueId: string, commentId: string) => void;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const useIssues = (): IssueContextType => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};

interface IssueProviderProps {
  children: ReactNode;
}

export const IssueProvider = ({ children }: IssueProviderProps) => {
  const [issues, setIssues] = useState<Issue[]>([]);

  // Initialize with mock data
  useEffect(() => {
    const mockIssues: Issue[] = [
      {
        id: '1',
        title: 'Pothole on Main Street needs immediate repair',
        description: 'There\'s a large pothole at the intersection of Main Street and Oak Avenue that\'s been growing larger after recent rains. It\'s causing damage to vehicles and is dangerous for cyclists.',
        location: 'Main Street & Oak Avenue',
        imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
        status: 'open',
        upvotes: 47,
        downvotes: 3,
        userVotes: {},
        author: 'Sarah Johnson',
        authorId: '1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'infrastructure',
        priority: 'high',
        comments: [
          {
            id: '1',
            author: 'Mike Chen',
            authorId: '2',
            content: 'I\'ve also noticed this. My car hit it yesterday and it felt really rough.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            author: 'Lisa Brown',
            authorId: '3',
            content: 'Has anyone contacted the city about this yet?',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: '2',
        title: 'Park playground equipment is damaged and unsafe',
        description: 'Several pieces of playground equipment at Riverside Park have broken or missing parts. The swing set has a broken chain and the slide has a sharp edge that could hurt children.',
        location: 'Riverside Park',
        status: 'in-progress',
        upvotes: 32,
        downvotes: 1,
        userVotes: {},
        author: 'David Wilson',
        authorId: '4',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'parks',
        priority: 'medium',
        comments: [
          {
            id: '3',
            author: 'Jennifer Lee',
            authorId: '5',
            content: 'This is really concerning. I have young kids who play here.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: '3',
        title: 'Streetlight out on Elm Street - safety concern',
        description: 'The streetlight on Elm Street between 2nd and 3rd Avenue has been out for over a week. This area gets really dark at night and feels unsafe for pedestrians.',
        location: 'Elm Street (2nd-3rd Ave)',
        status: 'resolved',
        upvotes: 28,
        downvotes: 0,
        userVotes: {},
        author: 'Robert Garcia',
        authorId: '6',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'safety',
        priority: 'high',
        comments: [
          {
            id: '4',
            author: 'City Representative',
            authorId: 'admin1',
            content: 'Thank you for reporting this. The light has been repaired and should be working now.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: '4',
        title: 'Need more bike lanes on University Avenue',
        description: 'University Avenue is heavily used by cyclists but lacks proper bike lanes. This creates dangerous situations as bikes and cars share the narrow road.',
        location: 'University Avenue',
        status: 'open',
        upvotes: 56,
        downvotes: 12,
        userVotes: {},
        author: 'Emily Rodriguez',
        authorId: '7',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'transportation',
        priority: 'medium',
        comments: []
      }
    ];
    setIssues(mockIssues);
  }, []);

  const addIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'userVotes' | 'comments'>) => {
    const newIssue: Issue = {
      ...issueData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVotes: {},
      comments: []
    };
    setIssues(prev => [newIssue, ...prev]);
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id 
        ? { ...issue, ...updates, updatedAt: new Date().toISOString() }
        : issue
    ));
  };

  const deleteIssue = (id: string, soft = true) => {
    if (soft) {
      updateIssue(id, { isDeleted: true });
    } else {
      setIssues(prev => prev.filter(issue => issue.id !== id));
    }
  };

  const getIssue = (id: string) => {
    return issues.find(issue => issue.id === id && !issue.isDeleted);
  };

  const getUserIssues = (userId: string) => {
    return issues.filter(issue => issue.authorId === userId && !issue.isDeleted);
  };

  const voteOnIssue = (issueId: string, userId: string, type: 'up' | 'down') => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const currentVote = issue.userVotes[userId];
        const newUserVotes = { ...issue.userVotes };
        let newUpvotes = issue.upvotes;
        let newDownvotes = issue.downvotes;

        // Remove previous vote if exists
        if (currentVote === 'up') {
          newUpvotes--;
        } else if (currentVote === 'down') {
          newDownvotes--;
        }

        // Add new vote if different from current
        if (currentVote !== type) {
          newUserVotes[userId] = type;
          if (type === 'up') {
            newUpvotes++;
          } else {
            newDownvotes++;
          }
        } else {
          // Remove vote if clicking same vote type
          delete newUserVotes[userId];
        }

        return {
          ...issue,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVotes: newUserVotes
        };
      }
      return issue;
    }));
  };

  const addComment = (issueId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setIssues(prev => prev.map(issue =>
      issue.id === issueId
        ? { ...issue, comments: [...issue.comments, newComment] }
        : issue
    ));
  };

  const updateComment = (issueId: string, commentId: string, content: string) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId
        ? {
            ...issue,
            comments: issue.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, content, updatedAt: new Date().toISOString() }
                : comment
            )
          }
        : issue
    ));
  };

  const deleteComment = (issueId: string, commentId: string) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId
        ? {
            ...issue,
            comments: issue.comments.filter(comment => comment.id !== commentId)
          }
        : issue
    ));
  };

  const value: IssueContextType = {
    issues: issues.filter(issue => !issue.isDeleted),
    addIssue,
    updateIssue,
    deleteIssue,
    getIssue,
    getUserIssues,
    voteOnIssue,
    addComment,
    updateComment,
    deleteComment
  };

  return (
    <IssueContext.Provider value={value}>
      {children}
    </IssueContext.Provider>
  );
};
