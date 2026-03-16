import React from "react"
export default function InsightBanner({ data }) {

  if (!data) {
    return (
      <div className="insight-banner">
        Loading insights...
      </div>
    );
  }

  return (
    <div className="insight-banner">
      <h3>Today's Insight</h3>
      <p>Your accuracy improved by {data.improvement}%</p>
    </div>
  );
}