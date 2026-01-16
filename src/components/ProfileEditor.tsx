"use client";

import { useState } from "react";
import { X, User, FileText, Camera } from "lucide-react";
import type { Profile } from "@/types";

interface ProfileEditorProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile;
    onSave: (profile: Profile) => void;
}

export default function ProfileEditor({
    isOpen,
    onClose,
    profile,
    onSave,
}: ProfileEditorProps) {
    const [name, setName] = useState(profile.name);
    const [bio, setBio] = useState(profile.bio);
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: name.trim(),
            bio: bio.trim(),
            avatarUrl: avatarUrl.trim() || undefined,
        });
        onClose();
    };

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

                <h2 className="text-2xl font-bold mb-6 gradient-text">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <User size={16} />
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <FileText size={16} />
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="A short bio about yourself..."
                            className="w-full min-h-[100px] resize-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Camera size={16} />
                            Avatar URL (optional)
                        </label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
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
                            disabled={!name.trim()}
                            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
