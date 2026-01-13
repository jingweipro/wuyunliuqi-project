/**
 * 用户信息本地存储管理
 */

export interface UserInfo {
  id: string;
  nickname?: string;
  avatar?: string;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  region?: string;
  isAnonymous: boolean;
  createdAt: string;
}

const USER_STORAGE_KEY = 'wuyun_liuqi_user';

/**
 * 生成简单的唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): UserInfo | null {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to get user info:', e);
  }
  return null;
}

/**
 * 保存用户信息
 */
export function saveUser(user: UserInfo): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user info:', e);
  }
}

/**
 * 创建匿名用户
 */
export function createAnonymousUser(): UserInfo {
  const user: UserInfo = {
    id: generateId(),
    nickname: '访客',
    isAnonymous: true,
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  return user;
}

/**
 * 创建带出生信息的用户
 */
export function createUserWithBirthInfo(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  region?: string,
  nickname?: string
): UserInfo {
  const user: UserInfo = {
    id: generateId(),
    nickname: nickname || `用户${birthYear}`,
    birthYear,
    birthMonth,
    birthDay,
    region,
    isAnonymous: false,
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  return user;
}

/**
 * 更新用户信息
 */
export function updateUser(updates: Partial<UserInfo>): UserInfo | null {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const updatedUser = { ...currentUser, ...updates };
  saveUser(updatedUser);
  return updatedUser;
}

/**
 * 清除用户信息（登出）
 */
export function clearUser(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear user info:', e);
  }
}

/**
 * 检查用户是否已登录
 */
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
