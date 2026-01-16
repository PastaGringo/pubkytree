"use client";

import { User } from "lucide-react";

interface AvatarProps {
    src?: string;
    name: string;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-28 h-28 text-4xl",
    xl: "w-36 h-36 text-5xl",
};

export default function Avatar({ src, name, size = "lg" }: AvatarProps) {
    const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    if (src) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden gradient-border glow float`}>
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={`${sizeClasses[size]} rounded-full gradient-border glow float flex items-center justify-center bg-gradient-to-br from-purple-600 via-cyan-500 to-pink-500`}
        >
            {initials || <User className="w-1/2 h-1/2 text-white/80" />}
        </div>
    );
}
