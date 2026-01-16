import { Metadata } from "next";
import PublicProfileClient from "./PublicProfileClient";

interface Props {
    params: Promise<{ pubkey: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { pubkey } = await params;
    const shortKey = `${pubkey.slice(0, 8)}...${pubkey.slice(-6)}`;

    return {
        title: `Profile ${shortKey} | PubkyTree`,
        description: `View this user's links on PubkyTree - the decentralized link-in-bio.`,
        openGraph: {
            title: `Profile on PubkyTree`,
            description: `Decentralized link-in-bio powered by Pubky`,
            type: "profile",
        },
    };
}

export default async function PublicProfilePage({ params }: Props) {
    const { pubkey } = await params;
    return <PublicProfileClient pubkey={pubkey} />;
}
