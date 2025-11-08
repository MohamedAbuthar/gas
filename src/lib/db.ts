import { db } from './firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  UpdateData,
  where,
} from 'firebase/firestore';

// Types
export interface DailyUpdate extends Record<string, unknown> {
  id?: string;
  title: string;
  description: string;
  author: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'in-progress' | 'pending';
  createdAt?: Timestamp;
}

export interface AttendanceRecord extends Record<string, unknown> {
  id?: string;
  date: string; // YYYY-MM-DD
  deliveryManId: string;
  deliveryManName: string;
  employeeId: string;
  phone: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
  checkInTime: string;
  checkOutTime: string;
  totalHours: string;
  location: string;
  vehicleNumber: string;
  notes: string;
  overtime: number;
  lateMinutes: number;
  earlyDeparture: number;
  createdAt?: Timestamp;
}

export interface MemberRecord extends Record<string, unknown> {
  id?: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive';
}

export interface RoleRecord {
  id?: string;
  name: string;
  description: string;
  department: string;
  permissions: string[];
}

export interface UserRecord {
  id?: string;
  email: string;
  password: string; // In production, this should be hashed
  name: string;
  role: 'admin' | 'viewer';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Collection names
const COL_UPDATES = 'dailyUpdates';
const COL_ATTENDANCE = 'attendance';
const COL_MEMBERS = 'members';
const COL_ROLES = 'roles';
const COL_USERS = 'users';

// Daily Updates
export async function listDailyUpdates(): Promise<DailyUpdate[]> {
  const q = query(collection(db, COL_UPDATES), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DailyUpdate) }));
}

export async function createDailyUpdate(payload: DailyUpdate): Promise<string> {
  const ref = await addDoc(collection(db, COL_UPDATES), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDailyUpdate(id: string): Promise<DailyUpdate | null> {
  const dref = doc(db, COL_UPDATES, id);
  const snap = await getDoc(dref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as DailyUpdate) }) : null;
}

export async function updateDailyUpdate(id: string, data: Partial<DailyUpdate>) {
  await updateDoc(doc(db, COL_UPDATES, id), data as UpdateData<DailyUpdate>);
}

export async function deleteDailyUpdate(id: string) {
  await deleteDoc(doc(db, COL_UPDATES, id));
}

// Attendance
export async function listAttendance(): Promise<AttendanceRecord[]> {
  const q = query(collection(db, COL_ATTENDANCE), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AttendanceRecord) }));
}

export async function listAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const q = query(collection(db, COL_ATTENDANCE), where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AttendanceRecord) }));
}

export async function createAttendance(payload: AttendanceRecord): Promise<string> {
  const ref = await addDoc(collection(db, COL_ATTENDANCE), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAttendance(id: string): Promise<AttendanceRecord | null> {
  const dref = doc(db, COL_ATTENDANCE, id);
  const snap = await getDoc(dref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as AttendanceRecord) }) : null;
}

export async function updateAttendance(id: string, data: Partial<AttendanceRecord>) {
  await updateDoc(doc(db, COL_ATTENDANCE, id), data as UpdateData<AttendanceRecord>);
}

export async function deleteAttendance(id: string) {
  await deleteDoc(doc(db, COL_ATTENDANCE, id));
}

// Members
export async function listMembers(): Promise<MemberRecord[]> {
  const q = query(collection(db, COL_MEMBERS), orderBy('joinDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as MemberRecord) }));
}

export async function createMember(payload: MemberRecord): Promise<string> {
  const ref = await addDoc(collection(db, COL_MEMBERS), payload);
  return ref.id;
}

export async function getMember(id: string): Promise<MemberRecord | null> {
  const dref = doc(db, COL_MEMBERS, id);
  const snap = await getDoc(dref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as MemberRecord) }) : null;
}

export async function updateMember(id: string, data: Partial<MemberRecord>) {
  await updateDoc(doc(db, COL_MEMBERS, id), data as UpdateData<MemberRecord>);
}

export async function deleteMember(id: string) {
  await deleteDoc(doc(db, COL_MEMBERS, id));
}

// Roles
export async function listRoles(): Promise<RoleRecord[]> {
  const q = query(collection(db, COL_ROLES), orderBy('name', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RoleRecord) }));
}

export async function createRole(payload: RoleRecord): Promise<string> {
  const ref = await addDoc(collection(db, COL_ROLES), payload);
  return ref.id;
}

export async function getRole(id: string): Promise<RoleRecord | null> {
  const dref = doc(db, COL_ROLES, id);
  const snap = await getDoc(dref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as RoleRecord) }) : null;
}

export async function updateRole(id: string, data: Partial<RoleRecord>) {
  await updateDoc(doc(db, COL_ROLES, id), data as UpdateData<RoleRecord>);
}

export async function deleteRole(id: string) {
  await deleteDoc(doc(db, COL_ROLES, id));
}

// Users / Authentication
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const q = query(collection(db, COL_USERS), where('email', '==', email.toLowerCase().trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as UserRecord) };
}

export async function authenticateUser(email: string, password: string): Promise<UserRecord | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  // Simple password comparison (in production, use hashed passwords)
  if (user.password === password) {
    // Remove password from returned object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as UserRecord;
  }
  return null;
}

export async function listUsers(): Promise<UserRecord[]> {
  const q = query(collection(db, COL_USERS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as UserRecord;
    // Remove password from list
    const { password: _, ...userWithoutPassword } = data;
    return { id: d.id, ...userWithoutPassword } as UserRecord;
  });
}

export async function createUser(payload: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COL_USERS), {
    ...payload,
    email: payload.email.toLowerCase().trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUser(id: string): Promise<UserRecord | null> {
  const dref = doc(db, COL_USERS, id);
  const snap = await getDoc(dref);
  if (!snap.exists()) return null;
  const data = snap.data() as UserRecord;
  // Remove password
  const { password: _, ...userWithoutPassword } = data;
  return { id: snap.id, ...userWithoutPassword } as UserRecord;
}

export async function updateUser(id: string, data: Partial<Omit<UserRecord, 'id' | 'password'>>) {
  await updateDoc(doc(db, COL_USERS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  } as UpdateData<UserRecord>);
}

export async function deleteUser(id: string) {
  await deleteDoc(doc(db, COL_USERS, id));
}

// Initialize admin user if not exists
export async function initializeAdminUser() {
  const adminEmail = 'habeebmohamed@gmail.com';
  const existingAdmin = await getUserByEmail(adminEmail);
  if (!existingAdmin) {
    await createUser({
      email: adminEmail,
      password: 'Habeeb@01',
      name: 'Admin User',
      role: 'admin',
    });
  }
}

// Optional generic helpers
export async function removeDocById(col: string, id: string) {
  await deleteDoc(doc(db, col, id));
}

export async function updateDocById<T extends object>(col: string, id: string, data: Partial<T>) {
  await updateDoc(doc(db, col, id), data as UpdateData<T>);
}
