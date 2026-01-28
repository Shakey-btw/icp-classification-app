import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Website {
  id: number;
  url: string;
  original_data: Record<string, any>;
}

interface ClassificationHistory {
  website_id: number;
  classification: 'icp' | 'not_icp';
  timestamp: string;
}

export interface Session {
  session_id: string;
  created_at: string;
  total_websites: number;
  current_index: number;
  classifications: Record<number, 'icp' | 'not_icp'>;
  classification_history: ClassificationHistory[];
  websites: Website[];
  csv_filename: string;
}

interface ICPClassificationDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
  };
}

class StorageManager {
  private dbPromise: Promise<IDBPDatabase<ICPClassificationDB>> | null = null;

  private getDB(): Promise<IDBPDatabase<ICPClassificationDB>> {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB is only available in the browser');
    }

    if (!this.dbPromise) {
      this.dbPromise = openDB<ICPClassificationDB>('icp-classification', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('sessions')) {
            db.createObjectStore('sessions', { keyPath: 'session_id' });
          }
        },
      });
    }

    return this.dbPromise;
  }

  async createSession(
    websites: Website[],
    filename: string
  ): Promise<Session> {
    const session: Session = {
      session_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      total_websites: websites.length,
      current_index: 0,
      classifications: {},
      classification_history: [],
      websites,
      csv_filename: filename,
    };

    const db = await this.getDB();
    await db.put('sessions', session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const db = await this.getDB();
    return await db.get('sessions', sessionId);
  }

  async updateSession(session: Session): Promise<void> {
    const db = await this.getDB();
    await db.put('sessions', session);
  }

  async classify(
    sessionId: string,
    websiteId: number,
    classification: 'icp' | 'not_icp'
  ): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.classifications[websiteId] = classification;
    session.classification_history.push({
      website_id: websiteId,
      classification,
      timestamp: new Date().toISOString(),
    });
    session.current_index = websiteId + 1;

    await this.updateSession(session);
    return session;
  }

  async undo(sessionId: string): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.classification_history.length === 0) {
      return session; // Nothing to undo
    }

    const lastEntry = session.classification_history.pop()!;
    delete session.classifications[lastEntry.website_id];
    session.current_index = lastEntry.website_id;

    await this.updateSession(session);
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('sessions', sessionId);
  }

  async getAllSessions(): Promise<Session[]> {
    const db = await this.getDB();
    return await db.getAll('sessions');
  }
}

export const storage = new StorageManager();
