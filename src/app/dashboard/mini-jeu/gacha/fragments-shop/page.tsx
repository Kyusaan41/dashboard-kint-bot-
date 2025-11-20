"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Gem, Clock } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api-config";

interface FragmentShopItem {
  cardId: string;
  name: string;
  rarity: string;
  anime: string;
  priceFragments: number;
  // Optionnel : si le backend renvoie une info de possession, on l'utilise pour afficher un badge
  alreadyOwned?: boolean;
  owned?: boolean;
  hasCard?: boolean;
}

interface FragmentShopResponse {
  success: boolean;
  rotationEndsAt: string;
  items: FragmentShopItem[];
}

export default function FragmentsShopPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<FragmentShopItem[]>([]);
  const [rotationEndsAt, setRotationEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [fragmentsBalance, setFragmentsBalance] = useState<number | null>(null);
  const [ownedCardIds, setOwnedCardIds] = useState<Set<string>>(new Set());
  const [revealItem, setRevealItem] = useState<FragmentShopItem | null>(null);

  const userId = session?.user?.id as string | undefined;

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.gachaFragmentsShop, { cache: "no-store" });
        const data: FragmentShopResponse = await res.json();
        if (data.success) {
          // On filtre côté dashboard pour ne jamais proposer de cartes mythiques dans cette boutique
          const filteredItems = (data.items || []).filter(
            (item) => item.rarity.toLowerCase() !== "mythique" && item.rarity.toLowerCase() !== "mythic",
          );
          setItems(filteredItems);
          setRotationEndsAt(data.rotationEndsAt || null);
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error("[FRAGMENTS SHOP] Erreur de chargement:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  useEffect(() => {
    const fetchOwnedCards = async () => {
      if (!userId) return;
      try {
        const res = await fetch(API_ENDPOINTS.GACHA_COLLECTION(userId));
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.success || !data?.data?.collections) return;

        const nextSet = new Set<string>();
        for (const animeCollection of data.data.collections) {
          for (const collectedCard of animeCollection.cards || []) {
            if (collectedCard.cardId) {
              nextSet.add(collectedCard.cardId);
            }
          }
        }
        setOwnedCardIds(nextSet);
      } catch (e) {
        console.warn("[FRAGMENTS SHOP] Impossible de charger la collection utilisateur pour les badges de possession.");
      }
    };

    fetchOwnedCards();
  }, [userId]);

  useEffect(() => {
    // Optionnel : si ton endpoint /api/currency/me expose fragments_etoiles, on peut l'afficher ici
    const fetchFragments = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/currency/me`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.fragments_etoiles === "number") {
          setFragmentsBalance(data.fragments_etoiles);
        }
      } catch (e) {
        console.warn("[FRAGMENTS SHOP] Impossible de charger le solde de fragments.");
      }
    };

    fetchFragments();
  }, [userId]);

  const handleBuy = async (item: FragmentShopItem) => {
    if (!userId) {
      toast.error("Connecte-toi pour acheter avec des fragments.");
      return;
    }
    if (buyingId) return;

    // Vérifier le solde avant de lancer l'achat (tous les cas non valides sont considérés comme insuffisants)
    const currentBalance = Number(fragmentsBalance ?? NaN);
    console.log("[FRAGMENTS SHOP] handleBuy click", {
      fragmentsBalance,
      currentBalance,
      price: item.priceFragments,
      itemId: item.cardId,
    });
    if (!Number.isFinite(currentBalance) || currentBalance < item.priceFragments) {
      toast.error("Tu n'as pas assez de fragments d'étoiles pour acheter cette carte.");
      return;
    }

    setBuyingId(item.cardId);
    try {
      const res = await fetch(API_ENDPOINTS.gachaFragmentsShopBuy, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cardId: item.cardId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Achat impossible.");
      } else {
        toast.success(data.message || `Carte achetée, ajoutée à ta collection !`);
        if (typeof data.newFragmentsBalance === "number") {
          setFragmentsBalance(data.newFragmentsBalance);
        }
        // Marquer localement la carte comme possédée
        setOwnedCardIds((prev) => {
          const next = new Set(prev);
          next.add(item.cardId);
          return next;
        });
        setRevealItem(item);
      }
    } catch (e) {
      console.error("[FRAGMENTS SHOP] Erreur d'achat:", e);
      toast.error("Erreur lors de l'achat.");
    } finally {
      setBuyingId(null);
    }
  };

  const formatRotationRemaining = () => {
    if (!rotationEndsAt) return "";
    const end = new Date(rotationEndsAt).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return "Nouvelle rotation imminente";
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days}j ${hours}h restants`;
  };

  const visibleItems = useMemo(() => {
    // Double garde-fou : on re-filtre ici au cas où un item mythique se glisserait côté backend
    const filtered = items.filter(
      (item) => item.rarity.toLowerCase() !== "mythique" && item.rarity.toLowerCase() !== "mythic",
    );

    // Enrichir avec l'info de possession en se basant sur la collection utilisateur
    if (!ownedCardIds || ownedCardIds.size === 0) {
      return filtered;
    }

    return filtered.map((item) => ({
      ...item,
      hasCard: ownedCardIds.has(item.cardId) || item.hasCard || item.alreadyOwned || item.owned,
    }));
  }, [items, ownedCardIds]);

  const getRarityStyle = (rarity: string) => {
    const r = rarity.toLowerCase();
    if (r.includes("commun")) return "bg-slate-700/60 text-slate-50 border-slate-500/60";
    if (r.includes("rare")) return "bg-sky-700/40 text-sky-50 border-sky-400/70";
    if (r.includes("epique") || r.includes("épique"))
      return "bg-purple-700/40 text-purple-50 border-purple-400/70";
    if (r.includes("legendaire") || r.includes("légendaire"))
      return "bg-amber-700/40 text-amber-50 border-amber-400/70";
    return "bg-slate-700/40 text-slate-50 border-slate-500/60";
  };

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.6)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Boutique des Fragments d'étoiles
              </h1>
              <p className="text-sm text-white/70">
                Échange tes fragments contre une sélection spéciale de cartes (hors rareté mythique).
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
              <Gem className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">
                {fragmentsBalance !== null ? `${fragmentsBalance} fragments` : "Fragments: ?"}
              </span>
            </div>
            <Link href="/dashboard/mini-jeu/gacha">
              <button className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2 text-xs md:text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour au Gacha
              </button>
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-4 items-start">
          <div className="flex items-center gap-2 text-sm text-white/80 bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2">
            <Clock className="w-4 h-4 text-amber-300" />
            <span>{formatRotationRemaining()}</span>
          </div>

          <div className="text-xs md:text-sm text-white/70 bg-slate-900/60 border border-dashed border-purple-500/50 rounded-xl px-3 py-2 flex flex-col gap-1">
            <span className="font-semibold text-purple-200">Comment fonctionne la boutique ?</span>
            <span>1. Choisis une carte dans la liste ci-dessous.</span>
            <span>2. Vérifie le prix en fragments d'étoiles affiché sur la carte.</span>
            <span>3. Clique sur "Acheter" pour la débloquer en dépensant tes fragments.</span>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="nyx-spinner" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-20 text-white/60">
            Aucune carte n'est disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleItems.map((item) => (
              <motion.div
                key={item.cardId}
                className="relative bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-[0_18px_45px_rgba(15,23,42,0.9)] overflow-hidden"
                whileHover={{ scale: 1.03, translateY: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <div className="pointer-events-none absolute inset-px rounded-2xl border border-white/5" />

                <div className="mb-3 space-y-2">
                  <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <Image
                      src={`/gacha/cards/${item.cardId}.jpg`}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-[10px] uppercase tracking-wide text-white/50 line-clamp-1">
                      {item.anime}
                    </div>
                    <div
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold tracking-wide ${getRarityStyle(
                        item.rarity,
                      )}`}
                    >
                      {item.rarity}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold line-clamp-2">
                      {item.name}
                    </div>
                    {(item.alreadyOwned || item.owned || item.hasCard) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/80 text-emerald-50 border border-emerald-400/70 whitespace-nowrap">
                        Tu possèdes cette carte
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-yellow-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    {item.priceFragments} fragments
                  </div>
                  <button
                    disabled={!!buyingId}
                    onClick={() => handleBuy(item)}
                    className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-400 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-shadow"
                  >
                    {buyingId === item.cardId ? "Achat..." : "Acheter"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {revealItem && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4"
            onClick={() => setRevealItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative max-w-md w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/15 shadow-2xl p-6 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-purple-500/10 via-transparent to-amber-400/10" />

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold">Carte achetée !</h2>
                    <p className="text-sm text-white/70">La carte a été ajoutée à ta collection.</p>
                  </div>
                  <button
                    onClick={() => setRevealItem(null)}
                    className="px-2 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
                  >
                    Fermer
                  </button>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="relative w-32 h-48 rounded-xl overflow-hidden border border-white/20 bg-black/40 flex-shrink-0">
                    <Image
                      src={`/gacha/cards/${revealItem.cardId}.jpg`}
                      alt={revealItem.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs uppercase tracking-wide text-white/60">{revealItem.anime}</div>
                    <div className="text-lg font-semibold">{revealItem.name}</div>
                    <div
                      className={`inline-flex text-[11px] px-2 py-0.5 rounded-full border font-semibold tracking-wide ${getRarityStyle(
                        revealItem.rarity,
                      )}`}
                    >
                      {revealItem.rarity}
                    </div>
                    <div className="mt-2 text-xs text-yellow-300 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Achetée avec {revealItem.priceFragments} fragments d'étoiles
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
