"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import type { Profile, Link } from "@/types";
import { fetchNexusProfile, type NexusUserDetails } from "./nexus-api";

// Types for Pubky SDK - using 'any' to avoid conflicts with actual SDK types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PubkySession = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PubkyAuthFlow = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PubkySDK = any;

// App path for storing data
const APP_PATH = "/pub/pubkytree.app";
const PROFILE_PATH = `${APP_PATH}/profile.json`;
const LINKS_PATH = `${APP_PATH}/links.json`;

interface PubkyContextType {
    isConnected: boolean;
    isLoading: boolean;
    publicKey: string | null;
    publicKeyZ32: string | null;
    authUrl: string | null;
    error: string | null;
    nexusProfile: NexusUserDetails | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    saveProfile: (profile: Profile) => Promise<void>;
    saveLinks: (links: Link[]) => Promise<void>;
    loadData: () => Promise<{ profile: Profile | null; links: Link[] | null }>;
    fetchNexusData: () => Promise<NexusUserDetails | null>;
}

const PubkyContext = createContext<PubkyContextType | null>(null);

export function usePubky() {
    const context = useContext(PubkyContext);
    if (!context) {
        throw new Error("usePubky must be used within a PubkyProvider");
    }
    return context;
}

interface PubkyProviderProps {
    children: ReactNode;
}

export function PubkyProvider({ children }: PubkyProviderProps) {
    const [pubky, setPubky] = useState<PubkySDK | null>(null);
    const [session, setSession] = useState<PubkySession | null>(null);
    const [authFlow, setAuthFlow] = useState<PubkyAuthFlow | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nexusProfile, setNexusProfile] = useState<NexusUserDetails | null>(null);

    // Initialize SDK on mount (client-side only)
    useEffect(() => {
        const initSDK = async () => {
            try {
                // Dynamic import to avoid SSR issues with WASM
                const { Pubky, setLogLevel } = await import("@synonymdev/pubky");

                // Enable debug logging in development
                if (process.env.NODE_ENV === "development") {
                    try {
                        setLogLevel("debug");
                    } catch {
                        // Logger already initialized
                    }
                }

                const instance = new Pubky();
                setPubky(instance);

                // Try to restore session from localStorage
                const savedSession = localStorage.getItem("pubkytree_session");
                if (savedSession) {
                    try {
                        const restored = await instance.restoreSession(savedSession);
                        setSession(restored);
                        console.log("Session restored successfully");

                        // Fetch Nexus profile for restored session
                        const z32Key = restored.info.publicKey.z32();
                        const nexusData = await fetchNexusProfile(z32Key);
                        if (nexusData) {
                            setNexusProfile(nexusData);
                            console.log("Nexus profile loaded:", nexusData.details.name);
                        }
                    } catch (e) {
                        console.log("Could not restore session:", e);
                        localStorage.removeItem("pubkytree_session");
                    }
                }
            } catch (e) {
                console.error("Failed to initialize Pubky SDK:", e);
                setError("Failed to initialize Pubky SDK");
            }
        };

        initSDK();
    }, []);

    const fetchNexusData = useCallback(async (): Promise<NexusUserDetails | null> => {
        if (!session) return null;

        try {
            const z32Key = session.info.publicKey.z32();
            const data = await fetchNexusProfile(z32Key);
            if (data) {
                setNexusProfile(data);
            }
            return data;
        } catch (e) {
            console.error("Failed to fetch Nexus profile:", e);
            return null;
        }
    }, [session]);

    const connect = useCallback(async () => {
        if (!pubky) {
            setError("Pubky SDK not initialized");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Import AuthFlowKind
            const { AuthFlowKind } = await import("@synonymdev/pubky");

            // Request read/write permissions for our app path
            const caps = `${APP_PATH}/:rw`;
            const flow = pubky.startAuthFlow(caps, AuthFlowKind.signin());

            setAuthFlow(flow);
            console.log("Auth flow started. URL:", flow.authorizationUrl);

            // Wait for user to approve via Pubky Ring
            const newSession = await flow.awaitApproval();

            setSession(newSession);
            setAuthFlow(null);

            // Save session snapshot for restoration
            const snapshot = newSession.export();
            localStorage.setItem("pubkytree_session", snapshot);

            console.log("Connected! Public key:", newSession.info.publicKey.toString());

            // Fetch Nexus profile after connecting
            const z32Key = newSession.info.publicKey.z32();
            console.log("Fetching Nexus profile for:", z32Key);
            const nexusData = await fetchNexusProfile(z32Key);
            if (nexusData) {
                setNexusProfile(nexusData);
                console.log("Nexus profile loaded:", nexusData.details.name);
            } else {
                console.log("User not yet indexed on Nexus");
            }
        } catch (e) {
            console.error("Auth failed:", e);
            setError(e instanceof Error ? e.message : "Authentication failed");
            setAuthFlow(null);
        } finally {
            setIsLoading(false);
        }
    }, [pubky]);

    const disconnect = useCallback(async () => {
        if (session) {
            try {
                await session.signout();
            } catch (e) {
                console.error("Signout error:", e);
            }
        }
        setSession(null);
        setNexusProfile(null);
        localStorage.removeItem("pubkytree_session");
    }, [session]);

    const saveProfile = useCallback(
        async (profile: Profile) => {
            if (!session) {
                throw new Error("Not connected");
            }

            await session.storage.putJson(PROFILE_PATH, profile);
            console.log("Profile saved to Pubky");
        },
        [session]
    );

    const saveLinks = useCallback(
        async (links: Link[]) => {
            if (!session) {
                throw new Error("Not connected");
            }

            await session.storage.putJson(LINKS_PATH, links);
            console.log("Links saved to Pubky");
        },
        [session]
    );

    const loadData = useCallback(async (): Promise<{
        profile: Profile | null;
        links: Link[] | null;
    }> => {
        if (!session) {
            return { profile: null, links: null };
        }

        let profile: Profile | null = null;
        let links: Link[] | null = null;

        try {
            const profileExists = await session.storage.exists(PROFILE_PATH);
            if (profileExists) {
                profile = await session.storage.getJson(PROFILE_PATH) as Profile;
            }
        } catch (e) {
            console.log("No profile found:", e);
        }

        try {
            const linksExist = await session.storage.exists(LINKS_PATH);
            if (linksExist) {
                links = await session.storage.getJson(LINKS_PATH) as Link[];
            }
        } catch (e) {
            console.log("No links found:", e);
        }

        return { profile, links };
    }, [session]);

    const value: PubkyContextType = {
        isConnected: !!session,
        isLoading,
        publicKey: session?.info.publicKey.toString() ?? null,
        publicKeyZ32: session?.info.publicKey.z32() ?? null,
        authUrl: authFlow?.authorizationUrl ?? null,
        error,
        nexusProfile,
        connect,
        disconnect,
        saveProfile,
        saveLinks,
        loadData,
        fetchNexusData,
    };

    return (
        <PubkyContext.Provider value={value}>{children}</PubkyContext.Provider>
    );
}
