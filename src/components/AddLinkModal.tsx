"use client";

import { useState } from "react";
import { X, Link as LinkIcon, Type } from "lucide-react";

interface AddLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (title: string, url: string) => void;
}

export default function AddLinkModal({ isOpen, onClose, onAdd }: AddLinkModalProps) {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && url.trim()) {
            let finalUrl = url.trim();
            if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
                finalUrl = "https://" + finalUrl;
            }
            onAdd(title.trim(), finalUrl);
            setTitle("");
            setUrl("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-card p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 gradient-text">Add New Link</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Type size={16} />
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My awesome link"
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <LinkIcon size={16} />
                            URL
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !url.trim()}
                            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Add Link
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
