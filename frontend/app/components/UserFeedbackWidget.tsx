"use client";

import { useState, useEffect } from "react";
import { castVote, getVoteStats } from "../lib/api";
import AppIcon from "./AppIcon";

interface UserFeedbackWidgetProps {
  phoneId: string;
  phoneName: string;
}

function generateSessionId() {
  return "session-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function UserFeedbackWidget({ phoneId, phoneName }: UserFeedbackWidgetProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [hasVotedValue, setHasVotedValue] = useState(false);
  const [hasVotedFeatures, setHasVotedFeatures] = useState(false);
  
  const [valueStats, setValueStats] = useState<any>(null);
  const [featureStats, setFeatureStats] = useState<any>(null);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmittingValue, setIsSubmittingValue] = useState(false);
  const [isSubmittingFeatures, setIsSubmittingFeatures] = useState(false);

  // Initialize session and load cached votes
  useEffect(() => {
    let currentSessionId = localStorage.getItem("zozo_session_id");
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      localStorage.setItem("zozo_session_id", currentSessionId);
    }
    setSessionId(currentSessionId);

    const cachedValueVote = localStorage.getItem(`zozo_voted_value_${phoneId}`);
    if (cachedValueVote) setHasVotedValue(true);

    const cachedFeatureVote = localStorage.getItem(`zozo_voted_features_${phoneId}`);
    if (cachedFeatureVote) setHasVotedFeatures(true);

    // Fetch live stats
    fetchStats();
  }, [phoneId]);

  const fetchStats = async () => {
    try {
      const stats = await getVoteStats(phoneId);
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
    setHasVotedValue(true); // Optimistic UI update
    localStorage.setItem(`zozo_voted_value_${phoneId}`, value);

    // Optimistically update local stats
    setValueStats((prev: any) => {
      const current = prev || { totalVotes: 0, yesPercentage: 0, noPercentage: 0 };
      const newTotal = current.totalVotes + 1;
      
      // Rough approximation for immediate visual feedback
      const currentYesVotes = Math.round((current.yesPercentage / 100) * current.totalVotes);
      const newYesVotes = currentYesVotes + (value === "yes" ? 1 : 0);
      
      return {
        totalVotes: newTotal,
        yesPercentage: Math.round((newYesVotes / newTotal) * 100),
        noPercentage: Math.round(((newTotal - newYesVotes) / newTotal) * 100),
      };
    });

    try {
      await castVote({
        phoneId,
        sessionId,
        pollType: "value_for_money",
        value,
      });
      // Re-fetch to get exact DB stats
      fetchStats();
    } catch (error) {
      console.error("Failed to cast vote", error);
    } finally {
      setIsSubmittingValue(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleFeatureSubmit = async () => {
    if (!sessionId || hasVotedFeatures || isSubmittingFeatures || selectedFeatures.length === 0) return;

    setIsSubmittingFeatures(true);
    setHasVotedFeatures(true);
    localStorage.setItem(`zozo_voted_features_${phoneId}`, JSON.stringify(selectedFeatures));

    try {
      await castVote({
        phoneId,
        sessionId,
        pollType: "favorite_features",
        value: selectedFeatures, // Send array of features
      });
      fetchStats();
    } catch (error) {
      console.error("Failed to cast features vote", error);
    } finally {
      setIsSubmittingFeatures(false);
    }
  };

  const AVAILABLE_FEATURES = ["Fast Processor", "Rear Camera", "Front Camera", "Battery Life", "Look & Design", "Display Quality"];

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        <h2 className="text-xl md:text-2xl font-bold text-text-main">{phoneName} User Feedback</h2>
      </div>

      {/* Value for Money Poll */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-border-subtle">
        <h3 className="font-bold text-text-main text-lg mb-4">Do you think {phoneName} is value for money?</h3>
        
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
            {/* Yes Bar */}
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
            
            {/* No Bar */}
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
        <h3 className="font-bold text-text-main text-lg mb-4">What do you like about {phoneName}?</h3>
        
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
             {featureStats?.features?.slice(0, 5).map((stat: any) => (
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
                <button className="font-bold text-text-main hover:text-primary flex items-center gap-1 cursor-pointer">
                  View Results <AppIcon name="chevron_right" size={18} />
                </button>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}
