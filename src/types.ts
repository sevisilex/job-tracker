export interface JobApplication {
  id?: number;
  title: string;
  description: string;
  location: string;
  tags: string[];
  url: string;
  createdAt: string;
  appliedAt: string | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  archivedAt: string | null;
}

export type FormData = Omit<JobApplication, 'id' | 'createdAt' | 'appliedAt' | 'rejectedAt' | 'archivedAt'>;

export const tagsStringToArray = (tagsStr: string): string[] => {
  return tagsStr.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');
};

export const tagsArrayToString = (tags: string[]): string => {
  return tags.join(', ');
};