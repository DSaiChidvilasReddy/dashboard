import React from 'react';

const AIInsights = ({ emotion, features, insights }) => {

  const isSentimentEnabled = features.find(f => f.name === 'Sentiment Detection')?.enabled;
  const isSuggestionsEnabled = features.find(f => f.name === 'Smart Suggestions')?.enabled;
  const isKeywordsEnabled = features.find(f => f.name === 'Keyword Extraction')?.enabled;

  // 🔥 NEW: Auto Summarization toggle
  const isSummarizationEnabled = features.find(f => f.name === 'Auto Summarization')?.enabled;

  // 🔥 LOADING STATE
  if (!insights) {
    return (
      <div className="panel ai-insights-panel" style={{ flex: '0 1 15%', minWidth: '210px' }}>
        <h3 style={{ marginBottom: '15px', color: '#212529' }}>AI Insights</h3>

        <div className="insights-panel">
          <div className="insight-section">
            <div style={{ fontSize: '14px', color: '#999' }}>
              Analyzing conversation...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const safeInsights = insights;

  // 🔥 NEW: CONTROL WHY OUTPUT
  const getReasonText = () => {
    if (!isSummarizationEnabled) {
      return "Auto Summarization is disabled. Enable it to view AI-generated explanation of the conversation.";
    }

    return safeInsights.reason || 'No explanation provided';
  };

  return (
    <div className="panel ai-insights-panel" style={{ flex: '0 1 16%', minWidth: '210px' }}>
      <h3 style={{ marginBottom: '15px', color: '#212529' }}>AI Insights</h3>

      <div className="insights-panel">

        {/* Emotion + Confidence */}
        {isSentimentEnabled ? (
          <>
            <div className="insight-section">
              <div className="insight-label">Detected Emotion</div>
              <div className="insight-value">
                {safeInsights.emotion || 'Unknown'}
              </div>
            </div>

            <div className="insight-section">
              <div className="insight-label">Confidence Score</div>
              <div className="insight-value">
                {safeInsights.confidence !== null && safeInsights.confidence !== undefined
                  ? `${safeInsights.confidence}%`
                  : 'N/A'}
              </div>

              {safeInsights.confidence !== null && safeInsights.confidence !== undefined && (
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${safeInsights.confidence}%` }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="insight-section">
            <div className="insight-label">Sentiment Detection</div>
            <div className="insight-value" style={{ color: '#999' }}>
              Disabled
            </div>
          </div>
        )}

        {/* Keywords */}
        {isKeywordsEnabled ? (
          <div className="insight-section">
            <div className="insight-label">Keywords Detected</div>
            <div className="keywords">
              {safeInsights.keywords && safeInsights.keywords.length > 0 ? (
                safeInsights.keywords.map((k, i) => (
                  <span key={i} className="keyword-tag">{k}</span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: '#999' }}>
                  No keywords detected
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="insight-section">
            <div className="insight-label">Keywords</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Disabled
            </div>
          </div>
        )}

        {/* Suggestions */}
        {isSuggestionsEnabled ? (
          <div className="insight-section">
            <div className="insight-label">Suggested Actions</div>
            <ul className="suggested-actions-list">
              {safeInsights.suggestedActions && safeInsights.suggestedActions.length > 0 ? (
                safeInsights.suggestedActions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))
              ) : (
                <li style={{ color: '#999' }}>
                  No suggestions available
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="insight-section">
            <div className="insight-label">Suggestions</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Disabled
            </div>
          </div>
        )}

        {/* 🔥 WHY (NOW CONTROLLED BY FEATURE) */}
        <div className="insight-section">
          <div className="insight-label">Why?</div>
          <div style={{ fontSize: '13px', color: '#495057' }}>
            {getReasonText()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIInsights;