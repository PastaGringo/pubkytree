"use client";

import { ExternalLink, GripVertical, Trash2, BarChart3 } from "lucide-react";
import type { Link } from "@/types";

interface LinkCardProps {
    link: Link;
    isEditing?: boolean;
    onDelete?: (id: string) => void;
    onDragStart?: (id: string) => void;
}

export default function LinkCard({
    link,
    isEditing = false,
    onDelete,
    onDragStart,
}: LinkCardProps) {
    const handleClick = () => {
        if (!isEditing) {
            window.open(link.url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        glass-card link-card p-4 cursor-pointer
        flex items-center gap-4
        ${isEditing ? "cursor-default" : ""}
      `}
        >
            {isEditing && (
                <button
                    className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
                    onMouseDown={() => onDragStart?.(link.id)}
                >
                    <GripVertical size={20} />
                </button>
            )}

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{link.title}</h3>
                <p className="text-sm text-gray-400 truncate">{link.url}</p>
            </div>

            {isEditing ? (
                <div className="flex items-center gap-3">
                    {link.clicks !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                            <BarChart3 size={16} />
                            <span>{link.clicks}</span>
                        </div>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(link.id);
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ) : (
                <ExternalLink size={20} className="text-gray-400 flex-shrink-0" />
            )}
        </div>
    );
}
