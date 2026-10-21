"use client";

import { useState, useEffect } from "react";
import { castVehicleVote, getVehicleVoteStats } from "../lib/api";
import AppIcon from "./AppIcon";

interface VehicleFeedbackWidgetProps {
  vehicleId: string;
  vehicleName: string;
  evCategory?: string;
  bodyType?: string;
}

function generateSessionId() {
  return "session-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Poll options tailored to the kind of EV being viewed, so a scooter isn't asked
// about "Interior & Tech" and a car isn't asked about "Portability".
const FEATURE_SETS: Record<string, string[]> = {
  car: ["Driving Range", "Charging Speed", "Performance", "Interior & Tech", "Safety & ADAS", "Ride Comfort"],
  bike: ["Driving Range", "Top Speed", "Build Quality", "Charging Time", "Comfort", "Value for Money"],
  scooter: ["Driving Range", "Top Speed", "Build Quality", "Charging Time", "Comfort", "Value for Money"],
  cycle: ["Range", "Motor Power", "Build Quality", "Battery Life", "Comfort", "Portability"],
  rickshaw: ["Range", "Load Capacity", "Build Quality", "Charging Time", "Running Cost", "Comfort"],
  truck: ["Range", "Payload Capacity", "Towing Power", "Charging Speed", "Build Quality", "Running Cost"],
};

function resolveFeatures(evCategory?: string, bodyType?: string): string[] {
  const keys = [evCategory, bodyType]
    .filter(Boolean)
    .map((s) => (s as string).toLowerCase().trim());

  for (const key of keys) {
    if (FEATURE_SETS[key]) return FEATURE_SETS[key];
    // two-wheeler synonyms
    if (/scooter|moped/.test(key)) return FEATURE_SETS.scooter;
    if (/bike|motorcycle/.test(key)) return FEATURE_SETS.bike;
    if (/cycle|bicycle|e-?bike/.test(key)) return FEATURE_SETS.cycle;
    if (/rickshaw|tuk/.test(key)) return FEATURE_SETS.rickshaw;
    if (/truck|van|bus|pickup/.test(key)) return FEATURE_SETS.truck;
  }
  // Default to the car set (covers Sedan, SUV, Crossover, Hatchback, etc.)
  return FEATURE_SETS.car;
}

export default function VehicleFeedbackWidget({
  vehicleId,
  vehicleName,
  evCategory,
  bodyType,
}: VehicleFeedbackWidgetProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [hasVotedValue, setHasVotedValue] = useState(false);
  const [hasVotedFeatures, setHasVotedFeatures] = useState(false);

  const [valueStats, setValueStats] = useState<any>(null);
  const [featureStats, setFeatureStats] = useState<any>(null);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmittingValue, setIsSubmittingValue] = useState(false);
  const [isSubmittingFeatures, setIsSubmittingFeatures] = useState(false);

  const AVAILABLE_FEATURES = resolveFeatures(evCategory, bodyType);

  useEffect(() => {
    let currentSessionId = localStorage.getItem("zozo_session_id");
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      localStorage.setItem("zozo_session_id", currentSessionId);
    }
    setSessionId(currentSessionId);

    const cachedValueVote = localStorage.getItem(`zozo_ev_voted_value_${vehicleId}`);
    if (cachedValueVote) setHasVotedValue(true);

    const cachedFeatureVote = localStorage.getItem(`zozo_ev_voted_features_${vehicleId}`);
    if (cachedFeatureVote) setHasVotedFeatures(true);

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const fetchStats = async () => {
    try {
      const stats = await getVehicleVoteStats(vehicleId);
      if (stats) {
        setValueStats(stats.valueForMoney);
        setFeatureStats(stats.favoriteFeatures);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const handleValueVote = async (value: "yes" | "no") => {
    if (!sessionId || hasVotedValue || isSubmittingValue) return;

    setIsSubmittingValue(true);
    setHasVotedValue(true);
    localStorage.setItem(`zozo_ev_voted_value_${vehicleId}`, value);

    setValueStats((prev: any) => {
      const current = prev || { totalVotes: 0, yesPercentage: 0, noPercentage: 0 };
      const newTotal = current.totalVotes + 1;
      const currentYesVotes = Math.round((current.yesPercentage / 100) * current.totalVotes);
      const newYesVotes = currentYesVotes + (value === "yes" ? 1 : 0);
      return {
        totalVotes: newTotal,
        yesPercentage: Math.round((newYesVotes / newTotal) * 100),
        noPercentage: Math.round(((newTotal - newYesVotes) / newTotal) * 100),
      };
    });

    try {
      await castVehicleVote({ vehicleId, sessionId, pollType: "value_for_money", value });
      fetchStats();
    } catch (error) {
      console.error("Failed to cast vote", error);
    } finally {
      setIsSubmittingValue(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleFeatureSubmit = async () => {
    if (!sessionId || hasVotedFeatures || isSubmittingFeatures || selectedFeatures.length === 0) return;

    setIsSubmittingFeatures(true);
    setHasVotedFeatures(true);
    localStorage.setItem(`zozo_ev_voted_features_${vehicleId}`, JSON.stringify(selectedFeatures));

    try {
      await castVehicleVote({ vehicleId, sessionId, pollType: "favorite_features", value: selectedFeatures });
      fetchStats();
    } catch (error) {
      console.error("Failed to cast features vote", error);
    } finally {
      setIsSubmittingFeatures(false);
    }
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        <h2 className="text-xl md:text-2xl font-bold text-text-main">{vehicleName} User Feedback</h2>
      </div>

      {/* Value for Money Poll */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-border-subtle">
        <h3 className="font-bold text-text-main text-lg mb-4">Do you think {vehicleName} is value for money?</h3>

        {!hasVotedValue ? (
          <div className="flex gap-4">
            <button
              onClick={() => handleValueVote("yes")}
              disabled={isSubmittingValue}
              className="flex-1 py-3 bg-surface-white border border-border-subtle hover:border-primary hover:text-primary rounded-lg font-semibold text-text-main transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => handleValueVote("no")}
              disabled={isSubmittingValue}
              className="flex-1 py-3 bg-surface-white border border-border-subtle hover:border-primary hover:text-primary rounded-lg font-semibold text-text-main transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-12 bg-surface-white rounded-lg overflow-hidden flex items-center px-4 border border-border-subtle">
              <div
                className="absolute top-0 left-0 h-full bg-[#FFEEDD] transition-all duration-1000 ease-out"
                style={{ width: `${valueStats?.yesPercentage || 0}%` }}
              ></div>
              <div className="relative z-10 w-full flex justify-between font-semibold">
                <span className="text-text-main">Yes</span>
                <span className="text-[#FF9800]">{valueStats?.yesPercentage || 0}%</span>
              </div>
            </div>

            <div className="relative h-12 bg-surface-white rounded-lg overflow-hidden flex items-center px-4 border border-border-subtle">
              <div
                className="absolute top-0 left-0 h-full bg-[#FFEEDD] transition-all duration-1000 ease-out"
                style={{ width: `${valueStats?.noPercentage || 0}%` }}
              ></div>
              <div className="relative z-10 w-full flex justify-between font-semibold">
                <span className="text-text-main">No</span>
                <span className="text-[#FF9800]">{valueStats?.noPercentage || 0}%</span>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 text-sm text-text-muted mt-2">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-[#FF9800] border-2 border-surface-container-low"></div>
                <div className="w-5 h-5 rounded-full bg-[#4CAF50] border-2 border-surface-container-low"></div>
                <div className="w-5 h-5 rounded-full bg-[#2196F3] border-2 border-surface-container-low"></div>
              </div>
              <span>{valueStats?.totalVotes || 0} User Votes</span>
              <span className="ml-4">Thanks for your vote!</span>
            </div>
          </div>
        )}
      </div>

      {/* Favorite Features Poll */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-border-subtle">
        <h3 className="font-bold text-text-main text-lg mb-4">What do you like most about {vehicleName}?</h3>

        {!hasVotedFeatures ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {AVAILABLE_FEATURES.map((feature) => (
                <label key={feature} className="flex items-center gap-3 p-3 bg-surface-white border border-border-subtle rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                  />
                  <span className="font-medium text-text-main">{feature}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleFeatureSubmit}
              disabled={isSubmittingFeatures || selectedFeatures.length === 0}
              className="w-full py-3 bg-[#D1D1D1] hover:bg-[#C0C0C0] text-text-main font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              Vote
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {featureStats?.features?.slice(0, 6).map((stat: any) => (
              <div key={stat.name} className="relative h-10 bg-surface-white rounded-lg overflow-hidden flex items-center px-4 border border-border-subtle">
                <div
                  className="absolute top-0 left-0 h-full bg-[#FFEEDD] transition-all duration-1000 ease-out"
                  style={{ width: `${stat.percentage || 0}%` }}
                ></div>
                <div className="relative z-10 w-full flex justify-between text-sm font-semibold">
                  <span className="text-text-main">{stat.name}</span>
                  <span className="text-[#FF9800]">{stat.percentage || 0}%</span>
                </div>
              </div>
            ))}

            {(!featureStats || featureStats.features?.length === 0) && (
              <p className="text-sm text-text-muted">You are the first to vote! Results updating...</p>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 rounded-full bg-[#FF9800] border-2 border-surface-container-low"></div>
                  <div className="w-5 h-5 rounded-full bg-[#E91E63] border-2 border-surface-container-low"></div>
                </div>
                <span>{featureStats?.totalVotes || 1} User Votes</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
