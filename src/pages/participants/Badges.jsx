import React, { useState, useEffect } from "react";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { SkeletonBase, SkeletonText } from "../../components/shared/SkeletonLoader";
import { ChevronDown } from "lucide-react";

// Import all badge images
import BronzeBadge from "../../assets/badges/BRONZE.png";
import SilverBadge from "../../assets/badges/SILVER.png";
import GoldBadge from "../../assets/badges/GOLD.png";
import TitaniumBadge from "../../assets/badges/TITANIUM.png";
import PlatinumBadge from "../../assets/badges/PLATINUM.png";
import QuartzBadge from "../../assets/badges/QUARTZ.png";
import OnyxBadge from "../../assets/badges/ONYX.png";
import PearlBadge from "../../assets/badges/PEARL.png";
import TopazBadge from "../../assets/badges/TOPAZ.png";
import GarnetBadge from "../../assets/badges/GARNET.png";
import AmethystBadge from "../../assets/badges/AMETHYST.png";
import JadeBadge from "../../assets/badges/JADE.png";
import ObsidianBadge from "../../assets/badges/OBSIDIAN.png";
import OpalBadge from "../../assets/badges/OPAL.png";
import SapphireBadge from "../../assets/badges/SAPPHIRE.png";
import EmeraldBadge from "../../assets/badges/EMERALD.png";
import RubyBadge from "../../assets/badges/RUBY.png";
import DiamondBadge from "../../assets/badges/DIAMOND.png";
import CobaltBadge from "../../assets/badges/COBALT.png";
import IvoryBadge from "../../assets/badges/IVORY.png";
import CrimsonBadge from "../../assets/badges/CRIMSON.png";
import AuroraBadge from "../../assets/badges/AURORA.png";
import SolarisBadge from "../../assets/badges/SOLARIS.png";
import LunarBadge from "../../assets/badges/LUNAR.png";
import EclipseBadge from "../../assets/badges/ECLIPSE.png";
import CelestialBadge from "../../assets/badges/CELESTIAL.png";
import MythicBadge from "../../assets/badges/MYTHIC.png";
import LegendaryBadge from "../../assets/badges/LEGENDARY.png";
import MasterBadge from "../../assets/badges/MASTER.png";
import GrandmasterBadge from "../../assets/badges/GRANDMASTER.png";

const Badges = () => {
  // NOTE:
  // - All badges start locked.
  // - Progress is driven purely from server data about completed evaluation forms.
  // - Once a badge's target is met, it becomes unlocked and clearly displayed.
  // - This component fetches completion counts on mount and maps them to badge states.

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_selectedBadge, setSelectedBadge] = useState(null);

  // Map theme to appropriate border color
  const getBorderColor = (theme) => {
    const colorMap = {
      bronze: "border-amber-600",
      silver: "border-gray-400",
      gold: "border-yellow-500",
      titanium: "border-gray-500",
      platinum: "border-gray-300",
      quartz: "border-pink-300",
      onyx: "border-gray-800",
      pearl: "border-orange-200",
      topaz: "border-orange-400",
      garnet: "border-red-600",
      amethyst: "border-purple-500",
      jade: "border-green-500",
      obsidian: "border-black",
      opal: "border-cyan-300",
      sapphire: "border-blue-500",
      emerald: "border-green-600",
      ruby: "border-red-500",
      diamond: "border-blue-300",
      cobalt: "border-blue-700",
      ivory: "border-orange-100",
      crimson: "border-red-700",
      aurora: "border-green-400",
      solaris: "border-yellow-400",
      lunar: "border-blue-200",
      eclipse: "border-gray-900",
      celestial: "border-purple-400",
      mythic: "border-indigo-600",
      legendary: "border-yellow-600",
      master: "border-purple-600",
      grandmaster: "border-orange-500",
    };
    return colorMap[theme] || "border-blue-500";
  };

  // Define evaluation-completion based badge tiers.
  // Adjust thresholds to match your product spec.
  // Base badge order; thresholds are computed (5, 10, 15, ...) based on position.
  const baseBadgeConfig = [
    { name: "Bronze", icon: BronzeBadge, highlighted: true, theme: "bronze" },
    { name: "Silver", icon: SilverBadge, theme: "silver" },
    { name: "Gold", icon: GoldBadge, theme: "gold" },
    { name: "Titanium", icon: TitaniumBadge, theme: "titanium" },
    { name: "Platinum", icon: PlatinumBadge, theme: "platinum" },
    { name: "Quartz", icon: QuartzBadge, theme: "quartz" },
    { name: "Onyx", icon: OnyxBadge, theme: "onyx" },
    { name: "Pearl", icon: PearlBadge, theme: "pearl" },
    { name: "Topaz", icon: TopazBadge, theme: "topaz" },
    { name: "Garnet", icon: GarnetBadge, theme: "garnet" },
    { name: "Amethyst", icon: AmethystBadge, theme: "amethyst" },
    { name: "Jade", icon: JadeBadge, theme: "jade" },
    { name: "Obsidian", icon: ObsidianBadge, theme: "obsidian" },
    { name: "Opal", icon: OpalBadge, theme: "opal" },
    { name: "Sapphire", icon: SapphireBadge, theme: "sapphire" },
    { name: "Emerald", icon: EmeraldBadge, theme: "emerald" },
    { name: "Ruby", icon: RubyBadge, theme: "ruby" },
    { name: "Diamond", icon: DiamondBadge, theme: "diamond" },
    { name: "Cobalt", icon: CobaltBadge, theme: "cobalt" },
    { name: "Ivory", icon: IvoryBadge, theme: "ivory" },
    { name: "Crimson", icon: CrimsonBadge, theme: "crimson" },
    { name: "Aurora", icon: AuroraBadge, theme: "aurora" },
    { name: "Solaris", icon: SolarisBadge, theme: "solaris" },
    { name: "Lunar", icon: LunarBadge, theme: "lunar" },
    { name: "Eclipse", icon: EclipseBadge, theme: "eclipse" },
    { name: "Celestial", icon: CelestialBadge, theme: "celestial" },
    { name: "Mythic", icon: MythicBadge, theme: "mythic" },
    { name: "Legendary", icon: LegendaryBadge, theme: "legendary" },
    { name: "Master", icon: MasterBadge, theme: "master" },
    { name: "Grandmaster", icon: GrandmasterBadge, theme: "grandmaster" },
  ];

  // Fetch participant's completion count from a dedicated endpoint.
  // This assumes backend exposes:
  //   GET /api/forms/completion-stats
  //   -> { success: true, data: { completedCount: number } }
  // If not yet implemented, wire it there using Form.responses/attendeeList.hasResponded.
  const fetchCompletionCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = new Headers();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }
      headers.append("Content-Type", "application/json");

      const response = await fetch("/api/forms/completion-stats", {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load badge progress (${response.status})`);
      }

      const json = await response.json();
      const completedCount = json?.data?.completedCount || 0;

      // Map base config to runtime badge objects with progressive progress/unlock state.
      // Badges unlock every 5 completed forms:
      //  - Bronze: 5/5
      //  - Silver: 10/10
      //  - Gold: 15/15
      //  - ...
      const computedBadges = baseBadgeConfig.map((badge, index) => {
        const target = (index + 1) * 5;
        const current = Math.min(completedCount, target);

        return {
          ...badge,
          target,
          unlocked: current >= target,
          progress: `${current}/${target}`,
        };
      });

      setBadges(computedBadges);
    } catch (err) {
      console.error("Error fetching badge progress:", err);
      setLoading(false);
      // Fallback: keep all badges locked with zero progress and 5-step targets.
      const lockedBadges = baseBadgeConfig.map((badge, index) => {
        const target = (index + 1) * 5;
        return {
          ...badge,
          target,
          unlocked: false,
          progress: `0/${target}`,
        };
      });
      setBadges(lockedBadges);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchCompletionCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh badge progress when component mounts (after form completion)
  useEffect(() => {
    const handleFocus = () => {
      fetchCompletionCount();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
  };

  const filteredBadges = badges.filter((badge) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Acquired Badges") return badge.unlocked;
    if (selectedFilter === "Not Acquired") return !badge.unlocked;
    return true;
  });

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="bg-gray-100 min-h-screen pb-8">
          <div className="max-w-full">
            {/* Filter Button Skeleton */}
            <div className="relative flex justify-end mb-6">
              <div className="bg-gray-300 p-3 rounded-lg w-32 h-12 animate-pulse"></div>
            </div>
            
            {/* Badges Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4 text-center border-2 border-gray-200">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-gray-300 bg-gray-300 animate-pulse"></div>
                  <SkeletonText lines={1} width="small" height="h-4" className="mx-auto" />
                  <SkeletonText lines={1} width="extraSmall" height="h-3" className="mx-auto mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="bg-gray-100 min-h-screen pb-8">
        <div className="max-w-full">
          <div className="relative flex justify-end mb-6">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-white p-3 rounded-lg border border-gray-300 flex items-center text-gray-700 z-20"
            >
              <span className="w-3 h-3 bg-blue-600 mr-2 rounded-sm"></span>
              <span>{selectedFilter}</span>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 ml-2 transition-transform duration-300 ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-30">
                <ul>
                  <li
                    onClick={() => handleFilterChange("All")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    All
                  </li>
                  <li
                    onClick={() => handleFilterChange("Acquired Badges")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Acquired Badges
                  </li>
                  <li
                    onClick={() => handleFilterChange("Not Acquired")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Not Acquired
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredBadges.map((badge, index) => {
              const handleBadgeClick = () => {
                if (badge.unlocked) {
                  setSelectedBadge(badge);
                }
              };

              return (
                <div
                  key={index}
                  onClick={handleBadgeClick}
                  className={`rounded-lg p-4 text-center transition-all duration-300 cursor-pointer select-none border-2 ${
                    badge.unlocked
                      ? `bg-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${getBorderColor(
                          badge.theme
                        )}`
                      : "bg-[#B7B7B8] cursor-not-allowed border-gray-400"
                  } ${
                    badge.highlighted && selectedFilter === "All"
                      ? "shadow-lg"
                      : ""
                  }`}
                >
                  <img
                    src={badge.icon}
                    alt={badge.name}
                    className={`w-20 h-20 mx-auto mb-3 rounded-full border-2 transition-transform duration-200 ${
                      badge.unlocked
                        ? `border-opacity-70 ${getBorderColor(badge.theme)}`
                        : "border-gray-400"
                    } ${badge.unlocked ? "" : "filter grayscale"} ${
                      badge.unlocked ? "hover:rotate-12" : ""
                    }`}
                  />
                  <h3 className="font-semibold text-gray-800">{badge.name}</h3>
                  <p className="text-sm text-gray-500">{badge.progress}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default Badges;
