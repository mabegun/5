// User types
export interface User {
  id: string
  email: string
  name: string
  role: string
  position?: string
  avatar?: string
  avatarColor?: string
}

// Project types
export interface Project {
  id: string
  name: string
  code?: string
  address?: string
  status: string
  type?: string
  expertise?: string
  deadline?: string
  progress: number
  sectionsTotal: number
  sectionsCompleted: number
  gip?: User
}

// Section types
export interface Section {
  id: string
  code: string
  description?: string
  status: string
  assigneeId?: string
  assignee?: User
  coAssignees?: string[]
  files?: any[]
  completedFile?: string
  completedFileName?: string
  projectId?: string
  project?: { id: string; name: string; code?: string }
  introBlocks?: IntroBlock[]
  remarks?: ExpertiseRemark[]
}

// Investigation types
export interface Investigation {
  id: string
  name: string
  status: string
  standardId?: string
  customName?: string
  isCustom?: boolean
  contractorName?: string
  contractorContact?: string
  contractorPhone?: string
  contractorEmail?: string
  contractNumber?: string
  contractDate?: string
  contractFile?: string
  contractFileName?: string
  resultFile?: string
  resultFileName?: string
  startDate?: string
  endDate?: string
  description?: string
}

// Expertise types
export interface Expertise {
  id: string
  stageName?: string
  startDate?: string
  endDate?: string
  experts?: Expert[]
  files?: { name: string; path: string }[]
  remarks?: ExpertiseRemark[]
  project?: { id: string; name: string; code?: string; sections: { id: string; code: string; description?: string }[] }
}

export interface Expert {
  name: string
  phone?: string
  email?: string
  organization?: string
}

// Remark types
export interface ExpertiseRemark {
  id: string
  expertiseId?: string
  sectionId?: string
  sectionCode?: string
  number?: string
  content: string
  fileName?: string
  filePath?: string
  status: string
  responseContent?: string
  responseFile?: string
  responseFileName?: string
  respondedAt?: string
  createdAt?: string
  comments?: RemarkComment[]
  section?: { id: string; code: string; description?: string }
}

export interface RemarkComment {
  id: string
  content: string
  authorId: string
  fileName?: string
  filePath?: string
  createdAt: string
}

// Message types
export interface Message {
  id: string
  content: string
  author?: User
  isCritical: boolean
  fileName?: string
  filePath?: string
  createdAt: string
}

// Intro Block types
export interface IntroBlock {
  id: string
  type: string
  title: string
  content?: string
  fileName?: string
  filePath?: string
}

// Standard types
export interface StandardSection {
  id: string
  code: string
  name: string
}

export interface StandardInvestigation {
  id: string
  name: string
}

// Contact types
export interface Contact {
  id: string
  name: string
  position?: string
  company?: string
  phone?: string
  email?: string
  notes?: string
}
