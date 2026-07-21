import type { SupabaseLeader } from '../../types';

export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'website';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  verified: boolean;
  reason?: string;
}

export interface SocialVerificationResult {
  leaderId: string;
  leaderSlug: string;
  leaderName: string;
  links: SocialLink[];
  missingPlatforms: SocialPlatform[];
  hasAnyVerified: boolean;
}

const PLATFORM_PATTERNS: Record<SocialPlatform, RegExp[]> = {
  twitter: [
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/,
  ],
  facebook: [/^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+(\/)?$/],
  instagram: [/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/],
  youtube: [
    /^https?:\/\/(www\.)?youtube\.com\/(channel|c|user|@)[a-zA-Z0-9_-]+\/?$/,
    /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_.-]+\/?$/,
  ],
  linkedin: [
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
    /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9-]+\/?$/,
  ],
  website: [/^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+(\/.*)?$/],
};

const ALL_PLATFORMS: SocialPlatform[] = [
  'twitter',
  'facebook',
  'instagram',
  'youtube',
  'linkedin',
  'website',
];

/** Never generates fake links — only validates existing URLs */
export class SocialVerifier {
  verifyUrl(platform: SocialPlatform, url?: string | null): SocialLink {
    if (!url || url.trim() === '') {
      return { platform, url: '', verified: false, reason: 'empty' };
    }

    const trimmed = url.trim();
    const patterns = PLATFORM_PATTERNS[platform];
    const matches = patterns.some((p) => p.test(trimmed));

    if (!matches) {
      return { platform, url: trimmed, verified: false, reason: 'invalid_format' };
    }

    if (this.isSuspiciousUrl(trimmed)) {
      return { platform, url: trimmed, verified: false, reason: 'suspicious' };
    }

    return { platform, url: trimmed, verified: true };
  }

  verifyLeader(leader: SupabaseLeader): SocialVerificationResult {
    const fieldMap: Record<SocialPlatform, string | undefined> = {
      twitter: leader.twitter,
      facebook: leader.facebook,
      instagram: leader.instagram,
      youtube: leader.youtube,
      linkedin: leader.linkedin,
      website: leader.website || leader.official_profile_url,
    };

    const links = ALL_PLATFORMS.map((platform) =>
      this.verifyUrl(platform, fieldMap[platform])
    );

    const missingPlatforms = ALL_PLATFORMS.filter((p) => !fieldMap[p]?.trim());
    const hasAnyVerified = links.some((l) => l.verified);

    return {
      leaderId: leader.id,
      leaderSlug: leader.slug,
      leaderName: leader.name,
      links,
      missingPlatforms,
      hasAnyVerified,
    };
  }

  verifyAll(leaders: SupabaseLeader[]): SocialVerificationResult[] {
    return leaders.map((l) => this.verifyLeader(l));
  }

  countMissingSocial(leaders: SupabaseLeader[]): number {
    return leaders.filter((l) => {
      const result = this.verifyLeader(l);
      return result.missingPlatforms.length >= 4;
    }).length;
  }

  private isSuspiciousUrl(url: string): boolean {
    const lower = url.toLowerCase();
    const blocked = ['example.com', 'localhost', 'placeholder', 'fake', 'test.com', 'lorem'];
    return blocked.some((b) => lower.includes(b));
  }
}

export const socialVerifier = new SocialVerifier();
