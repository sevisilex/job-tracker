export interface JobApplication {
  createdAt: string
  title: string
  description: string
  location: string
  tags: string[]
  url: string
  url2: string | null
  appliedAt: string | null
  rejectedAt: string | null
  rejectedReason: string | null
  archivedAt: string | null
  favoriteAt: string | null
}

// export type FormData = Omit<JobApplication, 'createdAt' | 'appliedAt' | 'rejectedAt' | 'archivedAt'>
export interface FormData {
  title: string
  description: string
  location: string
  tags: string[]
  url: string
  url2: string | null
  rejectedReason?: string
  createdAt?: string
  appliedAt?: string
  rejectedAt?: string
  favoriteAt?: string
}

export const tagsStringToArray = (tagsStr: string): string[] => {
  return tagsStr
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '')
}

export const tagsArrayToString = (tags: string[]): string => {
  return tags.join(', ')
}
