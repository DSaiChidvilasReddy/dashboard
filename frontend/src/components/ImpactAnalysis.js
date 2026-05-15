import React, { useEffect, useState } from 'react';

const ImpactAnalysis = ({ features }) => {

  const [summary, setSummary] = useState("");

  const disabledFeatures = features.filter(f => !f.enabled);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/impact-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features })
        });

        const data = await res.json();
        setSummary(data.summary);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSummary();
  }, [features]);

  const featureImpactMap = {
    "Sentiment Detection": {
      ui: ["Emotion banners disabled", "No frustration alerts"],
      services: ["Sentiment analysis service inactive"],
      data: ["No emotion data in pipeline"],
      risk: "medium"
    },
    "Smart Suggestions": {
      ui: ["Suggestion panel hidden"],
      services: ["AI suggestion engine disabled"],
      data: ["No recommendation flow"],
      risk: "high"
    },
    "Keyword Extraction": {
      ui: ["Keyword tags not shown"],
      services: ["Keyword extraction disabled"],
      data: ["No keyword metadata"],
      risk: "medium"
    },
    "Translation": {
      ui: ["No multilingual support"],
      services: ["Translation service disabled"],
      data: ["Language processing removed"],
      risk: "low"
    },
    "Auto Summarization": {
      ui: ["No conversation summaries"],
      services: ["Summarization service inactive"],
      data: ["No summary generation"],
      risk: "low"
    }
  };

  let uiImpact = [];
  let serviceImpact = [];
  let dataImpact = [];
  let riskScore = 0;

  disabledFeatures.forEach(f => {
    const impact = featureImpactMap[f.name];
    if (!impact) return;

    uiImpact.push(...impact.ui);
    serviceImpact.push(...impact.services);
    dataImpact.push(...impact.data);

    if (impact.risk === "high") riskScore += 3;
    else if (impact.risk === "medium") riskScore += 2;
    else riskScore += 1;
  });

  const getRiskLevel = () => {
    if (riskScore === 0) return "low";
    if (riskScore <= 3) return "medium";
    return "high";
  };

  const riskLevel = getRiskLevel();

  const riskMessages = {
    low: ["Minimal system impact", "Core functionality intact"],
    medium: ["Reduced automation", "Higher agent effort", "Slower responses"],
    high: ["Critical AI disabled", "Low efficiency", "Poor experience"]
  };

  return (
    <div className="panel impact-analysis-panel">

      <h3 className="impact-header">
        Impact Analysis <span>✨ Powered by AI</span>
      </h3>

      <div className="impact-card">
        <div className="impact-title">Summary</div>
        <p className="impact-summary-text">
          {summary || "Analyzing impact..."}
        </p>
      </div>

      <div className="impact-card">
        <div className="impact-title">Affected Areas</div>

        <div className="impact-section">
          <strong>UI Components</strong>
          {uiImpact.map((u, i) => <div key={i}>• {u}</div>)}
        </div>

        <div className="impact-section">
          <strong>Services</strong>
          {serviceImpact.map((s, i) => <div key={i}>• {s}</div>)}
        </div>

        <div className="impact-section">
          <strong>Data Flow</strong>
          {dataImpact.map((d, i) => <div key={i}>• {d}</div>)}
        </div>
      </div>

      <div className="impact-card">
        <div className="impact-title">Potential Risks</div>
        <ul>
          {riskMessages[riskLevel].map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>

        <span className={`risk-badge ${riskLevel}`}>
          {riskLevel.toUpperCase()}
        </span>
      </div>

    </div>
  );
};

export default ImpactAnalysis;