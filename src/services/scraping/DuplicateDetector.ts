import type { SupabaseLeader } from '../../types';

export interface DuplicateMatch {
  leaderA: SupabaseLeader;
  leaderB: SupabaseLeader;
  reason: 'slug' | 'name' | 'image_hash' | 'constituency';
  confidence: number;
}

export class DuplicateDetector {
  detectBySlug(leaders: SupabaseLeader[]): DuplicateMatch[] {
    const seen = new Map<string, SupabaseLeader>();
    const matches: DuplicateMatch[] = [];

    for (const leader of leaders) {
      const key = leader.slug?.toLowerCase();
      if (!key) continue;
      const existing = seen.get(key);
      if (existing) {
        matches.push({ leaderA: existing, leaderB: leader, reason: 'slug', confidence: 1.0 });
      } else {
        seen.set(key, leader);
      }
    }
    return matches;
  }

  detectByName(leaders: SupabaseLeader[]): DuplicateMatch[] {
    const seen = new Map<string, SupabaseLeader>();
    const matches: DuplicateMatch[] = [];

    for (const leader of leaders) {
      const key = this.normalizeName(leader.name);
      if (!key) continue;
      const existing = seen.get(key);
      if (existing && existing.id !== leader.id) {
        matches.push({ leaderA: existing, leaderB: leader, reason: 'name', confidence: 0.85 });
      } else if (!existing) {
        seen.set(key, leader);
      }
    }
    return matches;
  }

  detectByImageHash(leaders: SupabaseLeader[]): DuplicateMatch[] {
    const seen = new Map<string, SupabaseLeader>();
    const matches: DuplicateMatch[] = [];

    for (const leader of leaders) {
      const hash = leader.image_hash;
      if (!hash) continue;
      const existing = seen.get(hash);
      if (existing && existing.id !== leader.id) {
        matches.push({ leaderA: existing, leaderB: leader, reason: 'image_hash', confidence: 0.95 });
      } else if (!existing) {
        seen.set(hash, leader);
      }
    }
    return matches;
  }

  detectAll(leaders: SupabaseLeader[]): DuplicateMatch[] {
    const all = [
      ...this.detectBySlug(leaders),
      ...this.detectByName(leaders),
      ...this.detectByImageHash(leaders),
    ];
    const seen = new Set<string>();
    return all.filter((m) => {
      const key = [m.leaderA.id, m.leaderB.id].sort().join(':');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/^(shri|smt|dr|mr|ms|hon'ble|honble)\.?\s+/i, '')
      .replace(/[^a-z\s]/g, '')
      .trim();
  }
}

export const duplicateDetector = new DuplicateDetector();
