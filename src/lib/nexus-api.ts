// Nexus API client for fetching social data

const NEXUS_API_BASE = "https://nexus.pubky.app/v0";

export interface NexusUserProfile {
    id: string;
    name: string;
    bio: string;
    image: string;
    links: NexusUserLink[];
    status: string;
    indexed_at: number;
}

export interface NexusUserLink {
    title: string;
    url: string;
}

export interface NexusUserDetails {
    details: NexusUserProfile;
    counts: {
        tags: number;
        posts: number;
        followers: number;
        following: number;
        friends: number;
    };
}

export interface NexusError {
    error: string;
}

/**
 * Fetch a user's profile from Nexus
 * @param userId - The user's public key in z32 format
 */
export async function fetchNexusProfile(
    userId: string
): Promise<NexusUserDetails | null> {
    try {
        // Remove "pubky" prefix if present
        const cleanId = userId.replace(/^pubky/, "");

        const response = await fetch(`${NEXUS_API_BASE}/user/${cleanId}`, {
            headers: {
                Accept: "application/json",
            },
        });

        if (response.status === 404) {
            console.log(`User ${cleanId} not found in Nexus (not indexed yet)`);
            return null;
        }

        if (!response.ok) {
            console.error(`Nexus API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Check if it's an error response
        if ("error" in data) {
            console.log(`Nexus error: ${(data as NexusError).error}`);
            return null;
        }

        return data as NexusUserDetails;
    } catch (error) {
        console.error("Failed to fetch from Nexus:", error);
        return null;
    }
}

/**
 * Search for users on Nexus
 * @param query - Search query
 * @param limit - Max results
 */
export async function searchNexusUsers(
    query: string,
    limit: number = 10
): Promise<NexusUserProfile[]> {
    try {
        const response = await fetch(
            `${NEXUS_API_BASE}/search/users?query=${encodeURIComponent(query)}&limit=${limit}`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            console.error(`Nexus search error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Failed to search Nexus:", error);
        return [];
    }
}

/**
 * Get recent/popular users from Nexus
 */
export async function getPopularNexusUsers(
    limit: number = 10
): Promise<NexusUserProfile[]> {
    try {
        const response = await fetch(
            `${NEXUS_API_BASE}/stream/users?source=pioneers&limit=${limit}`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            console.error(`Nexus stream error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Failed to get popular users:", error);
        return [];
    }
}

/**
 * Resolve a pubky:// URL to an HTTPS URL
 * Format: pubky://user_id/pub/... -> https://_pubky.user_id/pub/...
 * @param pubkyUrl - The pubky:// URL or direct HTTPS URL
 */
export function resolvePubkyImageUrl(pubkyUrl: string | undefined | null): string | undefined {
    if (!pubkyUrl) return undefined;

    // Already an HTTPS URL, return as-is
    if (pubkyUrl.startsWith("http://") || pubkyUrl.startsWith("https://")) {
        return pubkyUrl;
    }

    // Handle pubky:// protocol
    if (pubkyUrl.startsWith("pubky://")) {
        // Remove the protocol
        const path = pubkyUrl.replace("pubky://", "");
        // Split into user_id and rest of path
        const slashIndex = path.indexOf("/");
        if (slashIndex === -1) return undefined;

        const userId = path.slice(0, slashIndex);
        const filePath = path.slice(slashIndex);

        // Convert to HTTPS URL format
        // Uses _pubky. prefix for PKDNS resolution
        return `https://_pubky.${userId}${filePath}`;
    }

    // Handle raw z32 format without protocol (e.g., "userid/pub/...")
    if (pubkyUrl.includes("/pub/")) {
        const slashIndex = pubkyUrl.indexOf("/");
        if (slashIndex === -1) return undefined;

        const userId = pubkyUrl.slice(0, slashIndex);
        const filePath = pubkyUrl.slice(slashIndex);

        return `https://_pubky.${userId}${filePath}`;
    }

    return undefined;
}
