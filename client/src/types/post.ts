export interface Post {
  id: string;
  title: string;
  details: string;
  imageUrl?: string;
  postType?: 'LOST' | 'FOUND';
  type?: 'LOST' | 'FOUND';
  status: 'ACTIVE' | 'CLAIMED';
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    profileImageUrl?: string;
  };
  user?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  authorId?: string;
  groupId?: string;
}

export interface PostCardProps {
  post: Post;
  currentUserId: string;
  onStatusChange: (postId: string, newStatus: 'ACTIVE' | 'CLAIMED') => void;
}