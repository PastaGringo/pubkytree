"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Shield,
  Link2,
  Users,
  QrCode,
  ArrowRight,
  ExternalLink,
  Github,
} from "lucide-react";
import { usePubky } from "@/lib/pubky-context";
import QRModal from "@/components/QRModal";

export default function HomePage() {
  const router = useRouter();
  const { isConnected, publicKeyZ32 } = usePubky();
  const [showQRModal, setShowQRModal] = useState(false);

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (isConnected && publicKeyZ32) {
      router.push("/dashboard");
    }
  }, [isConnected, publicKeyZ32, router]);

  const features = [
    {
      icon: Shield,
      title: "Censorship Resistant",
      description: "Your links live on your own Pubky homeserver. No one can take them down.",
    },
    {
      icon: Link2,
      title: "Own Your Data",
      description: "Cryptographic keys give you full ownership. No account, no password.",
    },
    {
      icon: Users,
      title: "Social Graph",
      description: "Connect with the Pubky social network. Show your followers and following.",
    },
  ];

  return (
    <div className="min-h-screen bg-grid">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold gradient-text">PubkyTree</span>
          </div>
          <a
            href="https://github.com/PastaGringo/pubkytree"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Github size={20} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </header>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6">
            <Shield size={16} className="text-cyan-400" />
            <span className="text-sm text-gray-300">Decentralized & Censorship Resistant</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            Your <span className="gradient-text">Link-in-Bio</span>
            <br />
            That You Actually Own
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Create your decentralized link page powered by{" "}
            <a href="https://pubky.org" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
              Pubky
            </a>
            . No account needed. Just your cryptographic identity.
          </p>

          {/* Main CTA */}
          <button
            onClick={() => setShowQRModal(true)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105"
          >
            <QrCode size={24} />
            Connect with Pubky Ring
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Scan with the{" "}
            <a
              href="https://apps.apple.com/om/app/pubky-ring/id6739356756"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              Pubky Ring app
            </a>
          </p>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Profile */}
        <section className="max-w-lg mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            See it in action
          </h2>
          <a
            href="/pub/w3ase343kdnbtp4y3x69qd1qyt8peyrdtkhf671ujucc9i8fge6y"
            className="block glass-card p-6 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://nexus.pubky.app/static/files/w3ase343kdnbtp4y3x69qd1qyt8peyrdtkhf671ujucc9i8fge6y/0033KX51N1R70/main"
                alt="PastaGringo"
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  PastaGringo 🇫🇷
                  <ExternalLink size={16} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
                </h3>
                <p className="text-sm text-gray-500">🤖Wide coding</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              BTC, Lightning, Nostr, Pubky, Self Hosting, Photos, etc.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span><strong className="text-white">63</strong> followers</span>
              <span><strong className="text-white">62</strong> following</span>
              <span><strong className="text-white">935</strong> posts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-400">website</span>
              <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-400">x (twitter)</span>
              <span className="px-3 py-1 bg-pink-500/20 rounded-full text-xs text-pink-400">Github</span>
            </div>
          </a>
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-purple-400">
                1
              </div>
              <h3 className="font-semibold mb-2">Get Pubky Ring</h3>
              <p className="text-sm text-gray-400">Download the app and create your identity</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-cyan-400">
                2
              </div>
              <h3 className="font-semibold mb-2">Scan QR Code</h3>
              <p className="text-sm text-gray-400">Connect your identity to PubkyTree</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-pink-400">
                3
              </div>
              <h3 className="font-semibold mb-2">Share Your Link</h3>
              <p className="text-sm text-gray-400">Your profile is live at /pub/your-key</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center border-t border-white/10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-bold gradient-text">PubkyTree</span>
          </div>
          <p className="text-sm text-gray-500">
            Powered by{" "}
            <a href="https://github.com/pubky/pubky-core" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
              Pubky Core
            </a>
            {" "}+{" "}
            <a href="https://github.com/pubky/pubky-nexus" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              Nexus
            </a>
          </p>
        </footer>
      </div>

      {/* QR Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        onConnected={() => {
          setShowQRModal(false);
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
