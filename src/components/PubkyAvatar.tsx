"use client";

import { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";

interface PubkyAvatarProps {
    pubkyUrl?: string;
    fallbackUrl?: string;
    name: string;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-28 h-28 text-4xl",
    xl: "w-36 h-36 text-5xl",
};

const NEXUS_STATIC_BASE = "https://nexus.pubky.app/static/files";

/**
 * Convert a pubky:// URL to a Nexus static file URL
 * Input: pubky://userId/pub/pubky.app/files/fileId
 * Output: https://nexus.pubky.app/static/files/userId/fileId/main
 */
function convertPubkyToNexusUrl(pubkyUrl: string): string | null {
    try {
        // Remove pubky:// prefix if present
        let path = pubkyUrl;
        if (path.startsWith("pubky://")) {
            path = path.replace("pubky://", "");
        }

        // Expected format: userId/pub/pubky.app/files/fileId
        const match = path.match(/^([a-z0-9]+)\/pub\/pubky\.app\/files\/([A-Z0-9]+)$/);
        if (!match) {
            console.log("Pubky URL doesn't match expected format:", pubkyUrl);
            return null;
        }

        const [, userId, fileId] = match;
        return `${NEXUS_STATIC_BASE}/${userId}/${fileId}/main`;
    } catch (e) {
        console.error("Failed to parse pubky URL:", e);
        return null;
    }
}

/**
 * Avatar component that loads images from Nexus static file server
 */
export default function PubkyAvatar({
    pubkyUrl,
    fallbackUrl,
    name,
    size = "lg",
}: PubkyAvatarProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Get initials for fallback
    const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    useEffect(() => {
        setIsLoading(true);
        setError(false);

        // First priority: pubkyUrl -> Nexus static URL
        if (pubkyUrl) {
            const nexusUrl = convertPubkyToNexusUrl(pubkyUrl);
            if (nexusUrl) {
                console.log("Using Nexus static URL:", nexusUrl);
                setImageUrl(nexusUrl);
                setIsLoading(false);
                return;
            }
        }

        // Second priority: regular HTTPS fallback URL
        if (fallbackUrl && (fallbackUrl.startsWith("http://") || fallbackUrl.startsWith("https://"))) {
            setImageUrl(fallbackUrl);
            setIsLoading(false);
            return;
        }

        // No valid URL found
        setIsLoading(false);
        setImageUrl(null);
    }, [pubkyUrl, fallbackUrl]);

    // Loading state
    if (isLoading) {
        return (
            <div
                className={`${sizeClasses[size]} rounded-full gradient-border glow flex items-center justify-center bg-gradient-to-br from-purple-600 via-cyan-500 to-pink-500`}
            >
                <Loader2 className="w-1/3 h-1/3 text-white/80 animate-spin" />
            </div>
        );
    }

    // If we have an image URL, display it
    if (imageUrl && !error) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden gradient-border glow float`}>
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => {
                        console.error("Failed to load image:", imageUrl);
                        setError(true);
                    }}
                />
            </div>
        );
    }

    // Fallback to initials
    return (
        <div
            className={`${sizeClasses[size]} rounded-full gradient-border glow float flex items-center justify-center bg-gradient-to-br from-purple-600 via-cyan-500 to-pink-500 text-white font-bold`}
        >
            {initials || <User className="w-1/2 h-1/2 text-white/80" />}
        </div>
    );
}
