import { useState } from "react";
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
  const badgeData = [
    {
      name: "Bronze",
      progress: "5/5",
      unlocked: true,
      highlighted: true,
      icon: BronzeBadge,
    },
    { name: "Silver", progress: "10/10", unlocked: true, icon: SilverBadge },
    { name: "Gold", progress: "15/15", unlocked: true, icon: GoldBadge },
    {
      name: "Titanium",
      progress: "20/20",
      unlocked: true,
      icon: TitaniumBadge,
    },
    {
      name: "Platinum",
      progress: "25/25",
      unlocked: true,
      icon: PlatinumBadge,
    },
    { name: "Quartz", progress: "10/30", unlocked: false, icon: QuartzBadge },
    { name: "Onyx", progress: "15/35", unlocked: false, icon: OnyxBadge },
    { name: "Pearl", progress: "20/40", unlocked: false, icon: PearlBadge },
    { name: "Topaz", progress: "25/45", unlocked: false, icon: TopazBadge },
    { name: "Garnet", progress: "30/50", unlocked: false, icon: GarnetBadge },
    {
      name: "Amethyst",
      progress: "31/55",
      unlocked: false,
      icon: AmethystBadge,
    },
    { name: "Jade", progress: "38/60", unlocked: false, icon: JadeBadge },
    {
      name: "Obsidian",
      progress: "35/65",
      unlocked: false,
      icon: ObsidianBadge,
    },
    { name: "Opal", progress: "39/70", unlocked: false, icon: OpalBadge },
    {
      name: "Sapphire",
      progress: "31/75",
      unlocked: false,
      icon: SapphireBadge,
    },
    { name: "Emerald", progress: "31/80", unlocked: false, icon: EmeraldBadge },
    { name: "Ruby", progress: "31/85", unlocked: false, icon: RubyBadge },
    { name: "Diamond", progress: "31/90", unlocked: false, icon: DiamondBadge },
    { name: "Cobalt", progress: "31/95", unlocked: false, icon: CobaltBadge },
    { name: "Ivory", progress: "31/100", unlocked: false, icon: IvoryBadge },
    {
      name: "Crimson",
      progress: "31/105",
      unlocked: false,
      icon: CrimsonBadge,
    },
    { name: "Aurora", progress: "31/110", unlocked: false, icon: AuroraBadge },
    {
      name: "Solaris",
      progress: "31/115",
      unlocked: false,
      icon: SolarisBadge,
    },
    { name: "Lunar", progress: "31/125", unlocked: false, icon: LunarBadge },
    {
      name: "Eclipse",
      progress: "31/125",
      unlocked: false,
      icon: EclipseBadge,
    },
    {
      name: "Celestial",
      progress: "31/130",
      unlocked: false,
      icon: CelestialBadge,
    },
    { name: "Mythic", progress: "31/135", unlocked: false, icon: MythicBadge },
    {
      name: "Legendary",
      progress: "31/140",
      unlocked: false,
      icon: LegendaryBadge,
    },
    { name: "Master", progress: "31/145", unlocked: false, icon: MasterBadge },
    {
      name: "Grandmaster",
      progress: "31/150",
      unlocked: false,
      icon: GrandmasterBadge,
    },
  ];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
  };

  const filteredBadges = badgeData.filter((badge) => {
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
            {filteredBadges.map((badge, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 text-center transition-all duration-300 ${
                  badge.unlocked ? "bg-white shadow-sm" : "bg-[#B7B7B8]"
                } ${
                  badge.highlighted && selectedFilter === "All"
                    ? "border-2 border-blue-500 shadow-lg"
                    : ""
                }`}
              >
                <img
                  src={badge.icon}
                  alt={badge.name}
                  className={`w-20 h-20 mx-auto mb-3 ${
                    badge.unlocked ? "" : "filter grayscale"
                  }`}
                />
                <h3 className="font-semibold text-gray-800">{badge.name}</h3>
                <p className="text-sm text-gray-500">{badge.progress}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default Badges;
