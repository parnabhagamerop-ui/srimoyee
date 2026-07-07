import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add required Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If logged in but token is not in-memory (e.g. page refresh),
        // we might need to ask user to sign in again to obtain a fresh access token
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google to get the access token
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Interface for Backup File
export interface BackupData {
  logs: any[];
  settings: any;
  stats: any;
  profile: any;
  backupTime: string;
}

const BACKUP_FILENAME = 'pavoo_lulu_period_tracker_backup.json';

// Find backup file in Google Drive
export const findBackupFile = async (token: string): Promise<{ id: string; name: string; modifiedTime?: string } | null> => {
  try {
    const q = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to query Google Drive: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (err) {
    console.error('findBackupFile error:', err);
    throw err;
  }
};

// Create a new backup file or update existing one in Google Drive
export const saveBackupToDrive = async (token: string, backupData: BackupData): Promise<{ id: string }> => {
  try {
    // 1. Search if the backup file already exists
    const existingFile = await findBackupFile(token);
    let fileId = existingFile?.id;

    if (!fileId) {
      // 2. Create metadata if file doesn't exist
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: BACKUP_FILENAME,
          mimeType: 'application/json',
          description: 'Backup of Pavoo & Lulu Cartoon Period Tracker cycle and log data'
        })
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create file on Google Drive: ${createRes.statusText}`);
      }

      const fileMetadata = await createRes.json();
      fileId = fileMetadata.id;
    }

    if (!fileId) {
      throw new Error('Could not resolve Google Drive File ID');
    }

    // 3. Upload content of the backup file
    const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backupData, null, 2)
    });

    if (!uploadRes.ok) {
      throw new Error(`Failed to upload backup content to Google Drive: ${uploadRes.statusText}`);
    }

    return { id: fileId };
  } catch (err) {
    console.error('saveBackupToDrive error:', err);
    throw err;
  }
};

// Retrieve backup file content from Google Drive
export const loadBackupFromDrive = async (token: string, fileId: string): Promise<BackupData> => {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to download backup content: ${res.statusText}`);
    }

    const data = await res.json();
    return data as BackupData;
  } catch (err) {
    console.error('loadBackupFromDrive error:', err);
    throw err;
  }
};
