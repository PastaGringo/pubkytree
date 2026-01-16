"use client";

import { X, Smartphone, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { usePubky } from "@/lib/pubky-context";
import { useEffect } from "react";

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnected?: () => void;
}

export default function QRModal({
    isOpen,
    onClose,
    onConnected,
}: QRModalProps) {
    const { authUrl, isLoading, error, isConnected, connect } = usePubky();

    // Start auth flow when modal opens
    useEffect(() => {
        if (isOpen && !authUrl && !isLoading && !isConnected) {
            connect();
        }
    }, [isOpen, authUrl, isLoading, isConnected, connect]);

    // Close modal and callback when connected
    useEffect(() => {
        if (isConnected && isOpen) {
            onConnected?.();
            onClose();
        }
    }, [isConnected, isOpen, onConnected, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative glass-card p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-2 gradient-text">Connect with Pubky Ring</h2>
                <p className="text-gray-400 text-sm mb-6">
                    Scan this QR code with the Pubky Ring app to connect your identity
                </p>

                {/* Error display */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <div className="aspect-square bg-white rounded-xl p-4 mb-6 flex items-center justify-center">
                    {isLoading && !authUrl ? (
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Generating QR code...</p>
                        </div>
                    ) : authUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(authUrl)}`}
                                alt="QR Code"
                                className="w-full h-full max-w-[280px] max-h-[280px]"
                            />
                            {isLoading && (
                                <div className="mt-2 flex items-center gap-2 text-gray-500 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Waiting for approval...
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <p>QR Code Generation</p>
                            <button
                                onClick={connect}
                                className="mt-2 text-purple-400 hover:text-purple-300 text-sm underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </div>

                {/* Deeplink for mobile */}
                {authUrl && (
                    <a
                        href={authUrl}
                        className="btn btn-primary w-full mb-4"
                    >
                        Open in Pubky Ring
                        <ExternalLink size={16} />
                    </a>
                )}

                <div className="space-y-3">
                    <a
                        href="https://apps.apple.com/om/app/pubky-ring/id6739356756"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary w-full"
                    >
                        <Smartphone size={18} />
                        Download for iOS
                        <ExternalLink size={14} />
                    </a>
                    <a
                        href="https://play.google.com/store/apps/details?id=to.pubky.ring"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary w-full"
                    >
                        <Smartphone size={18} />
                        Download for Android
                        <ExternalLink size={14} />
                    </a>
                </div>

                <p className="text-center text-xs text-gray-500 mt-4">
                    Don&apos;t have Pubky Ring? Download it to create your decentralized identity.
                </p>
            </div>
        </div>
    );
}
