"use client";

import { Shield, ShieldOff, Key, QrCode, LogOut, Loader2, Cloud, CloudOff } from "lucide-react";
import { usePubky } from "@/lib/pubky-context";

interface PubkyStatusProps {
    onConnect: () => void;
    isSyncing?: boolean;
    lastSyncTime?: Date | null;
}

export default function PubkyStatus({
    onConnect,
    isSyncing = false,
    lastSyncTime,
}: PubkyStatusProps) {
    const { isConnected, publicKey, disconnect, isLoading } = usePubky();

    const truncatedKey = publicKey
        ? `${publicKey.slice(0, 12)}...${publicKey.slice(-8)}`
        : null;

    const formatSyncTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000) return "just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        return date.toLocaleTimeString();
    };

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isConnected ? (
                        <>
                            <div className="relative">
                                <Shield className="w-6 h-6 text-green-400" />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-400">Connected to Pubky</p>
                                {truncatedKey && (
                                    <p className="text-xs text-gray-500 font-mono">{truncatedKey}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <ShieldOff className="w-6 h-6 text-yellow-500" />
                            <div>
                                <p className="text-sm font-medium text-yellow-500">Demo Mode</p>
                                <p className="text-xs text-gray-500">Connect to save your data forever</p>
                            </div>
                        </>
                    )}
                </div>

                {isConnected ? (
                    <div className="flex items-center gap-2">
                        {/* Sync status */}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            {isSyncing ? (
                                <>
                                    <Loader2 size={14} className="animate-spin text-purple-400" />
                                    <span>Syncing...</span>
                                </>
                            ) : lastSyncTime ? (
                                <>
                                    <Cloud size={14} className="text-green-400" />
                                    <span>Synced {formatSyncTime(lastSyncTime)}</span>
                                </>
                            ) : (
                                <>
                                    <CloudOff size={14} />
                                    <span>Not synced</span>
                                </>
                            )}
                        </div>

                        <button
                            onClick={disconnect}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Disconnect"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onConnect}
                        disabled={isLoading}
                        className="btn btn-primary text-sm py-2 px-4 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <QrCode size={16} />
                        )}
                        Connect
                    </button>
                )}
            </div>

            {!isConnected && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                        <Key className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-500/80">
                            In demo mode, your links are stored locally in your browser. Connect with{" "}
                            <a
                                href="https://github.com/pubky/pubky-ring"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-yellow-400"
                            >
                                Pubky Ring
                            </a>{" "}
                            to own your data forever on your personal homeserver.
                        </p>
                    </div>
                </div>
            )}

            {isConnected && (
                <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-start gap-2">
                        <Cloud className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-green-400/80">
                            Your data is stored on your Pubky homeserver. It&apos;s yours forever,
                            accessible from anywhere, and can never be taken away.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
