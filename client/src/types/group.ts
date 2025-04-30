export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Creator {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  groupImageUrl: string | null;
  creator?: Creator;
  members?: Member[];
  createdAt?: string;
  memberCount?: number;
  postCount?: number;
}

export interface GroupDetails {
  id: string;
  name: string;
  code: string;
  groupImageUrl: string | null;
  createdAt?: string;
  memberCount?: number;
  postCount?: number;
  creator?: Creator;
  members?: Member[];
}

export interface GroupDetailsWithMembers extends GroupDetails {
  creator: Creator;
  members: Member[];
}

export interface LocationState {
  groupDetails: GroupDetails;
}