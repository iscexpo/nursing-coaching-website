export const ISC_SUBJECTS = [
  { id: 'subj_bn', name: 'Bangla', sortOrder: 0, isActive: true },
  { id: 'subj_en', name: 'English', sortOrder: 1, isActive: true },
  { id: 'subj_physics', name: 'Physics', sortOrder: 2, isActive: true },
  { id: 'subj_chemistry', name: 'Chemistry', sortOrder: 3, isActive: true },
  { id: 'subj_biology', name: 'Biology', sortOrder: 4, isActive: true },
  { id: 'subj_math', name: 'Higher Math', sortOrder: 5, isActive: true },
  { id: 'subj_ict', name: 'ICT', sortOrder: 6, isActive: true },
  { id: 'subj_gk', name: 'General Knowledge', sortOrder: 7, isActive: true },
] as const

export type IscSubjectSeed = (typeof ISC_SUBJECTS)[number]
