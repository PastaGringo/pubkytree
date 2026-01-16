"use client";

import { useState, useEffect } from "react";
import {
    Sparkles,
    Share2,
    Check,
    ExternalLink,
    AlertCircle,
    Loader2,
    Users,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import PubkyAvatar from "@/components/PubkyAvatar";
import { fetchNexusProfile, type NexusUserDetails } from "@/lib/nexus-api";
import type { Link as LinkType, Profile } from "@/types";

interface Props {
    pubkey: string;
}

// Merged link type for display
interface DisplayLink {
    title: string;
    url: string;
}

// Path where PubkyTree stores links on homeserver
const APP_PATH = "/pub/pubkytree.app";
const LINKS_PATH = `${APP_PATH}/links.json`;

export default function PublicProfileClient({ pubkey }: Props) {
    const [nexusProfile, setNexusProfile] = useState<NexusUserDetails | null>(null);
    const [pubkyTreeLinks, setPubkyTreeLinks] = useState<LinkType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch from Nexus (social graph data)
                const nexusData = await fetchNexusProfile(pubkey);
                if (nexusData) {
                    setNexusProfile(nexusData);
                }

                // Also try to fetch PubkyTree links from homeserver via SDK
                try {
                    const { Pubky } = await import("@synonymdev/pubky");
                    const pubkyInstance = new Pubky();

                    // Construct the address for public storage
                    const linksAddr = `pubky://${pubkey}${LINKS_PATH}`;

                    // Try to fetch PubkyTree links
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const pubkyLinks = await pubkyInstance.publicStorage.getJson(linksAddr as any) as LinkType[];
                    if (pubkyLinks && Array.isArray(pubkyLinks)) {
                        setPubkyTreeLinks(pubkyLinks);
                        console.log("Loaded PubkyTree links:", pubkyLinks);
                    }
                } catch (e) {
                    // PubkyTree links might not exist, that's okay
                    console.log("No PubkyTree links found:", e);
                }

                if (!nexusData) {
                    setError("Profile not found");
                }
            } catch (e) {
                console.error("Failed to load profile:", e);
                setError("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [pubkey]);

    // Merge Nexus links and PubkyTree links
    const getMergedLinks = (): DisplayLink[] => {
        const nexusLinks = nexusProfile?.details.links || [];

        // If we have PubkyTree links, use them (they may include Nexus links merged)
        if (pubkyTreeLinks.length > 0) {
            // Create a map of URLs to avoid duplicates
            const urlSet = new Set<string>();
            const merged: DisplayLink[] = [];

            // First add PubkyTree links (they have priority)
            for (const link of pubkyTreeLinks) {
                if (!urlSet.has(link.url)) {
                    urlSet.add(link.url);
                    merged.push({ title: link.title, url: link.url });
                }
            }

            // Then add any Nexus links not already in the list
            for (const link of nexusLinks) {
                if (!urlSet.has(link.url)) {
                    urlSet.add(link.url);
                    merged.push({ title: link.title, url: link.url });
                }
            }

            return merged;
        }

        // Fall back to Nexus links only
        return nexusLinks;
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: nexusProfile?.details.name || "PubkyTree Profile",
                    text: nexusProfile?.details.bio || "Check out my links",
                    url: shareUrl,
                });
            } catch {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-grid flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !nexusProfile) {
        return (
            <div className="min-h-screen bg-grid">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
                    <div className="glass-card p-8 rounded-2xl text-center max-w-md">
                        <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
                        <p className="text-gray-400 mb-6">
                            This user hasn&apos;t been indexed on Nexus yet, or the public key is invalid.
                        </p>
                        <p className="text-xs text-gray-600 font-mono mb-6 break-all">
                            {pubkey}
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { details, counts } = nexusProfile;
    const displayLinks = getMergedLinks();

    return (
        <div className="min-h-screen bg-grid">
            {/* Background glow effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium gradient-text">PubkyTree</span>
                    </Link>
                    <button
                        onClick={handleShare}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Share"
                    >
                        {copied ? (
                            <Check size={20} className="text-green-400" />
                        ) : (
                            <Share2 size={20} className="text-gray-400" />
                        )}
                    </button>
                </div>

                {/* Social Stats */}
                {(counts.followers > 0 || counts.following > 0) && (
                    <div className="mb-6 glass-card p-4 rounded-xl">
                        <div className="flex items-center justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-purple-400" />
                            </div>
                            <div className="text-center">
                                <span className="font-bold text-white">{counts.followers}</span>
                                <span className="text-gray-500 ml-1">followers</span>
                            </div>
                            <div className="text-center">
                                <span className="font-bold text-white">{counts.following}</span>
                                <span className="text-gray-500 ml-1">following</span>
                            </div>
                            {counts.posts > 0 && (
                                <div className="text-center">
                                    <span className="font-bold text-white">{counts.posts}</span>
                                    <span className="text-gray-500 ml-1">posts</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Profile Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <PubkyAvatar
                            pubkyUrl={details.image || undefined}
                            name={details.name}
                            size="lg"
                        />
                    </div>

                    <h1 className="text-2xl font-bold mb-2">{details.name}</h1>
                    {details.bio && (
                        <p className="text-gray-400 max-w-xs mx-auto whitespace-pre-wrap">
                            {details.bio}
                        </p>
                    )}

                    <p className="mt-2 text-xs text-gray-600 font-mono">
                        pubky{pubkey.slice(0, 8)}...{pubkey.slice(-6)}
                    </p>
                </div>

                {/* Links Section */}
                <div className="space-y-3">
                    {displayLinks.length > 0 ? (
                        displayLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block glass-card p-4 rounded-2xl hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{link.title}</h3>
                                        <p className="text-sm text-gray-500 truncate">{link.url}</p>
                                    </div>
                                    <ExternalLink
                                        size={18}
                                        className="text-gray-400 group-hover:text-purple-400 transition-colors ml-3 flex-shrink-0"
                                    />
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No links yet</p>
                        </div>
                    )}
                </div>

                {/* CTA for visitors */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-xl text-sm hover:bg-purple-600/30 transition-colors"
                    >
                        <Sparkles size={16} className="text-purple-400" />
                        Create your own PubkyTree
                    </Link>
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center">
                    <p className="text-xs text-gray-600">
                        Powered by{" "}
                        <a
                            href="https://github.com/pubky/pubky-core"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Pubky
                        </a>
                        {" "}+{" "}
                        <a
                            href="https://github.com/pubky/pubky-nexus"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            Nexus
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
}
