import React, { useState, useEffect } from "react";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
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
  const [_selectedBadge, setSelectedBadge] = useState(null);

  // Define evaluation-completion based badge tiers.
  // Adjust thresholds to match your product spec.
  // Base badge order; thresholds are computed (5, 10, 15, ...) based on position.
  const baseBadgeConfig = [
    { name: "Bronze", icon: BronzeBadge, highlighted: true },
    { name: "Silver", icon: SilverBadge },
    { name: "Gold", icon: GoldBadge },
    { name: "Titanium", icon: TitaniumBadge },
    { name: "Platinum", icon: PlatinumBadge },
    { name: "Quartz", icon: QuartzBadge },
    { name: "Onyx", icon: OnyxBadge },
    { name: "Pearl", icon: PearlBadge },
    { name: "Topaz", icon: TopazBadge },
    { name: "Garnet", icon: GarnetBadge },
    { name: "Amethyst", icon: AmethystBadge },
    { name: "Jade", icon: JadeBadge },
    { name: "Obsidian", icon: ObsidianBadge },
    { name: "Opal", icon: OpalBadge },
    { name: "Sapphire", icon: SapphireBadge },
    { name: "Emerald", icon: EmeraldBadge },
    { name: "Ruby", icon: RubyBadge },
    { name: "Diamond", icon: DiamondBadge },
    { name: "Cobalt", icon: CobaltBadge },
    { name: "Ivory", icon: IvoryBadge },
    { name: "Crimson", icon: CrimsonBadge },
    { name: "Aurora", icon: AuroraBadge },
    { name: "Solaris", icon: SolarisBadge },
    { name: "Lunar", icon: LunarBadge },
    { name: "Eclipse", icon: EclipseBadge },
    { name: "Celestial", icon: CelestialBadge },
    { name: "Mythic", icon: MythicBadge },
    { name: "Legendary", icon: LegendaryBadge },
    { name: "Master", icon: MasterBadge },
    { name: "Grandmaster", icon: GrandmasterBadge },
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
    }
  };

  // Initial load
  useEffect(() => {
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
                  className={`rounded-lg p-4 text-center transition-all duration-300 cursor-pointer select-none ${
                    badge.unlocked
                      ? "bg-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                      : "bg-[#B7B7B8] cursor-not-allowed"
                  } ${
                    badge.highlighted && selectedFilter === "All"
                      ? "border-2 border-blue-500 shadow-lg"
                      : ""
                  }`}
                >
                  <img
                    src={badge.icon}
                    alt={badge.name}
                    className={`w-20 h-20 mx-auto mb-3 transition-transform duration-200 ${
                      badge.unlocked ? "" : "filter grayscale"
                    } ${badge.unlocked ? "hover:rotate-12" : ""}`}
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
