"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Edit3,
    Share2,
    Settings,
    Check,
    Sparkles,
    RefreshCw,
    Users,
    ExternalLink,
    LogOut,
} from "lucide-react";
import Link from "next/link";
import PubkyAvatar from "@/components/PubkyAvatar";
import LinkCard from "@/components/LinkCard";
import AddLinkModal from "@/components/AddLinkModal";
import ProfileEditor from "@/components/ProfileEditor";
import PubkyStatus from "@/components/PubkyStatus";
import QRModal from "@/components/QRModal";
import { usePubky } from "@/lib/pubky-context";
import { DEMO_PROFILE, DEMO_LINKS, type Link as LinkType, type Profile } from "@/types";

export default function DashboardPage() {
    const router = useRouter();
    const {
        isConnected,
        isLoading: isAuthLoading,
        saveProfile,
        saveLinks,
        loadData,
        nexusProfile,
        publicKeyZ32,
        disconnect,
    } = usePubky();

    // State
    const [profile, setProfile] = useState<Profile>(DEMO_PROFILE);
    const [links, setLinks] = useState<LinkType[]>(DEMO_LINKS);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [hasImportedNexus, setHasImportedNexus] = useState(false);

    // Redirect to homepage if not connected (after loading)
    useEffect(() => {
        if (!isAuthLoading && !isConnected) {
            router.push("/");
        }
    }, [isConnected, isAuthLoading, router]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem("pubkytree_profile");
        const savedLinks = localStorage.getItem("pubkytree_links");

        if (savedProfile) {
            try {
                setProfile(JSON.parse(savedProfile));
            } catch (e) {
                console.error("Failed to parse saved profile", e);
            }
        }

        if (savedLinks) {
            try {
                setLinks(JSON.parse(savedLinks));
            } catch (e) {
                console.error("Failed to parse saved links", e);
            }
        }
    }, []);

    // Load from Pubky when connected
    const loadFromPubky = useCallback(async () => {
        if (!isConnected) return;

        setIsSyncing(true);
        try {
            const { profile: pubkyProfile, links: pubkyLinks } = await loadData();

            if (pubkyProfile) {
                setProfile(pubkyProfile);
                localStorage.setItem("pubkytree_profile", JSON.stringify(pubkyProfile));
            }

            if (pubkyLinks) {
                setLinks(pubkyLinks);
                localStorage.setItem("pubkytree_links", JSON.stringify(pubkyLinks));
            }

            setLastSyncTime(new Date());
        } catch (e) {
            console.error("Failed to load from Pubky:", e);
        } finally {
            setIsSyncing(false);
        }
    }, [isConnected, loadData]);

    useEffect(() => {
        if (isConnected) {
            loadFromPubky();
        }
    }, [isConnected, loadFromPubky]);

    // Import profile from Nexus if available
    const importFromNexus = useCallback(() => {
        if (nexusProfile && !hasImportedNexus) {
            const nexusData = nexusProfile.details;

            const importedProfile: Profile = {
                name: nexusData.name || profile.name,
                bio: nexusData.bio || profile.bio,
                avatarUrl: profile.avatarUrl,
                pubkyAvatarUrl: nexusData.image,
            };

            const importedLinks: LinkType[] = nexusData.links?.map((link, index) => ({
                id: `nexus-${index}`,
                title: link.title,
                url: link.url,
                order: index,
                clicks: 0,
            })) || [];

            const existingLinkUrls = new Set(importedLinks.map(l => l.url));
            const uniqueExistingLinks = links.filter(l => !existingLinkUrls.has(l.url));
            const mergedLinks = [...importedLinks, ...uniqueExistingLinks].map((l, i) => ({
                ...l,
                order: i,
            }));

            setProfile(importedProfile);
            setLinks(mergedLinks.length > 0 ? mergedLinks : links);
            setHasImportedNexus(true);

            localStorage.setItem("pubkytree_profile", JSON.stringify(importedProfile));
            if (mergedLinks.length > 0) {
                localStorage.setItem("pubkytree_links", JSON.stringify(mergedLinks));
            }
        }
    }, [nexusProfile, hasImportedNexus, profile, links]);

    useEffect(() => {
        if (nexusProfile && isConnected) {
            importFromNexus();
        }
    }, [nexusProfile, isConnected, importFromNexus]);

    // Save handlers
    const persistProfile = useCallback(async (newProfile: Profile) => {
        setProfile(newProfile);
        localStorage.setItem("pubkytree_profile", JSON.stringify(newProfile));

        if (isConnected) {
            setIsSyncing(true);
            try {
                await saveProfile(newProfile);
                setLastSyncTime(new Date());
            } catch (e) {
                console.error("Failed to save profile to Pubky:", e);
            } finally {
                setIsSyncing(false);
            }
        }
    }, [isConnected, saveProfile]);

    const persistLinks = useCallback(async (newLinks: LinkType[]) => {
        setLinks(newLinks);
        localStorage.setItem("pubkytree_links", JSON.stringify(newLinks));

        if (isConnected) {
            setIsSyncing(true);
            try {
                await saveLinks(newLinks);
                setLastSyncTime(new Date());
            } catch (e) {
                console.error("Failed to save links to Pubky:", e);
            } finally {
                setIsSyncing(false);
            }
        }
    }, [isConnected, saveLinks]);

    const handleAddLink = (title: string, url: string) => {
        const newLink: LinkType = {
            id: Date.now().toString(),
            title,
            url,
            order: links.length,
            clicks: 0,
        };
        persistLinks([...links, newLink]);
    };

    const handleDeleteLink = (id: string) => {
        persistLinks(links.filter((link) => link.id !== id));
    };

    const handleShare = async () => {
        if (!publicKeyZ32) return;
        const shareUrl = `${window.location.origin}/pub/${publicKeyZ32}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${profile.name} | PubkyTree`,
                    text: profile.bio,
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

    const syncToPubky = async () => {
        if (!isConnected) return;

        setIsSyncing(true);
        try {
            await saveProfile(profile);
            await saveLinks(links);
            setLastSyncTime(new Date());
        } catch (e) {
            console.error("Failed to sync to Pubky:", e);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        await disconnect();
        router.push("/");
    };

    // Show loading while checking auth
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-grid flex items-center justify-center">
                <div className="text-center">
                    <Sparkles className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not connected (redirect will happen)
    if (!isConnected) {
        return null;
    }

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
                <div className="flex justify-between items-center mb-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium gradient-text">PubkyTree</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={syncToPubky}
                            disabled={isSyncing}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-purple-400 disabled:opacity-50"
                            title="Sync to Pubky"
                        >
                            <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Share profile"
                        >
                            {copied ? (
                                <Check size={20} className="text-green-400" />
                            ) : (
                                <Share2 size={20} className="text-gray-400" />
                            )}
                        </button>
                        {publicKeyZ32 && (
                            <Link
                                href={`/pub/${publicKeyZ32}`}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-cyan-400"
                                title="View public profile"
                            >
                                <ExternalLink size={20} />
                            </Link>
                        )}
                        <button
                            onClick={handleDisconnect}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                            title="Disconnect"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Connection Status */}
                <div className="mb-6">
                    <PubkyStatus
                        onConnect={() => setShowQRModal(true)}
                        isSyncing={isSyncing}
                        lastSyncTime={lastSyncTime}
                    />
                </div>

                {/* Nexus Social Stats */}
                {nexusProfile && (
                    <div className="mb-6 glass-card p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Users size={16} className="text-purple-400" />
                                <span>Nexus Social Graph</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div>
                                    <span className="font-bold text-white">{nexusProfile.counts.followers}</span>
                                    <span className="text-gray-500 ml-1">followers</span>
                                </div>
                                <div>
                                    <span className="font-bold text-white">{nexusProfile.counts.following}</span>
                                    <span className="text-gray-500 ml-1">following</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <PubkyAvatar
                            pubkyUrl={profile.pubkyAvatarUrl}
                            fallbackUrl={profile.avatarUrl}
                            name={profile.name}
                            size="lg"
                        />
                        <button
                            onClick={() => setShowProfileEditor(true)}
                            className="absolute -bottom-1 -right-1 p-2 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors shadow-lg"
                        >
                            <Edit3 size={14} className="text-white" />
                        </button>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
                    <p className="text-gray-400 max-w-xs mx-auto">{profile.bio}</p>

                    {publicKeyZ32 && (
                        <p className="mt-2 text-xs text-gray-600 font-mono">
                            pubky{publicKeyZ32.slice(0, 8)}...{publicKeyZ32.slice(-6)}
                        </p>
                    )}
                </div>

                {/* Links Section */}
                <div className="space-y-3">
                    {links
                        .sort((a, b) => a.order - b.order)
                        .map((link) => (
                            <LinkCard
                                key={link.id}
                                link={link}
                                isEditing={true}
                                onDelete={handleDeleteLink}
                            />
                        ))}

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-600 rounded-2xl 
                       hover:border-purple-500 hover:bg-purple-500/10 
                       transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-purple-400"
                    >
                        <Plus size={20} />
                        Add New Link
                    </button>
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

            {/* Modals */}
            <AddLinkModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddLink}
            />

            <ProfileEditor
                isOpen={showProfileEditor}
                onClose={() => setShowProfileEditor(false)}
                profile={profile}
                onSave={persistProfile}
            />

            <QRModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                onConnected={() => setShowQRModal(false)}
            />
        </div>
    );
}
