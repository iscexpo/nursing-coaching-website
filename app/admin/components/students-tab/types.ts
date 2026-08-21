export const inputCls =
  'mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
export const labelCls = 'block text-sm font-medium text-foreground'

export type EducationField = {
  result: string
  institution: string
  year: string
  roll: string
  registrationNo: string
  board: string
  photoUrl: string
}
export type FormState = {
  name: string
  email: string
  password: string
  phoneNumber: string
  studentId: string
  image: string
  address: string
  village: string
  post: string
  policeStation: string
  district: string
  dateOfBirth: string
  guardianName: string
  guardianPhone: string
  institution: string
  ssc: EducationField
  hsc: EducationField
  honors: EducationField
}

export function emptyEducation(): EducationField {
  return {
    result: '',
    institution: '',
    year: '',
    roll: '',
    registrationNo: '',
    board: '',
    photoUrl: '',
  }
}

export function emptyForm(): FormState {
  return {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    studentId: '',
    image: '',
    address: '',
    village: '',
    post: '',
    policeStation: '',
    district: '',
    dateOfBirth: '',
    guardianName: '',
    guardianPhone: '',
    institution: '',
    ssc: emptyEducation(),
    hsc: emptyEducation(),
    honors: emptyEducation(),
  }
}