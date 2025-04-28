export interface Member {
    id: string;
    name: string;
    email: string;
    phone?: string;
  }
  
  export interface GroupDetails {
    id: string;
    name: string;
    code: string;
    groupImageUrl: string | null;
    createdAt?: string;
    memberCount?: number;
    postCount?: number;
  }
  
  export interface LocationState {
    groupDetails: GroupDetails;
  }