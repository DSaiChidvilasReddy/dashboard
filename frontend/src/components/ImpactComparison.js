import React from 'react';

const ImpactComparison = ({ features }) => {

  // 🔥 Convert features → quick lookup
  const featureMap = {};
  features.forEach(f => {
    featureMap[f.name] = f.enabled;
  });

  // ✅ BEFORE (All features ON)
  const beforeContent = [
    '✓ Emotion-aware UI (adaptive banners)',
    '✓ Smart AI suggestions for agents',
    '✓ Keyword extraction for insights',
    '✓ Faster issue resolution',
    '✓ Better customer satisfaction'
  ];

  // ✅ AFTER (Dynamic based on toggles)
  const afterContent = [];

  // Sentiment
  if (!featureMap['Sentiment Detection']) {
    afterContent.push('✗ No emotion detection → UI becomes static');
  } else {
    afterContent.push('✓ Emotion-aware UI active');
  }

  // Suggestions
  if (!featureMap['Smart Suggestions']) {
    afterContent.push('✗ No AI suggestions → agent must respond manually');
  } else {
    afterContent.push('✓ Smart suggestions assist agent replies');
  }

  // Keywords
  if (!featureMap['Keyword Extraction']) {
    afterContent.push('✗ No keyword insights → harder to understand issues');
  } else {
    afterContent.push('✓ Keywords highlight main customer concerns');
  }

  // Translation
  if (!featureMap['Translation']) {
    afterContent.push('✗ No translation → language barrier possible');
  } else {
    afterContent.push('✓ Multi-language support enabled');
  }

  // Summarization
  if (!featureMap['Auto Summarization']) {
    afterContent.push('✗ No summaries → longer conversations to review');
  } else {
    afterContent.push('✓ Auto summaries for quick understanding');
  }

  // 🔥 SYSTEM-LEVEL IMPACT SUMMARY
  const enabledCount = features.filter(f => f.enabled).length;

  let systemImpact = '';
  if (enabledCount === features.length) {
    systemImpact = ' Full AI capability → Best performance';
  } else if (enabledCount >= 3) {
    systemImpact = 'Moderate AI capability → Balanced performance';
  } else {
    systemImpact = 'Limited AI capability → Reduced efficiency';
  }

  return (
    <div className="panel impact-comparison-panel" style={{ flex: '0 1 35%', padding: '18px', minWidth: '300px' }}>
      <h3 style={{ marginBottom: '15px', color: '#212529' }}>
        Before vs After (Feature Impact)
      </h3>

      <div className="comparison-view">

        {/* BEFORE */}
        <div className="comparison-panel">
          <div className="comparison-title">
            <span>📊</span>
            <span>All Features Enabled</span>
          </div>

          <div className="comparison-content">
            {beforeContent.map((item, idx) => (
              <div key={idx} className="content-item">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* AFTER */}
        <div className="comparison-panel after">
          <div className="comparison-title">
            <span>⚙️</span>
            <span>Current System State</span>
          </div>

          <div className="comparison-content">
            {afterContent.map((item, idx) => (
              <div
                key={idx}
                className={`content-item`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 IMPACT SUMMARY */}
      <div style={{
        marginTop: '15px',
        padding: '15px',
        borderRadius: '8px',
        background: '#f1f3f5',
        fontSize: '15px',
        color: '#333333',
        border: '2px solid #4c6ef5'
      }}>
        {systemImpact}
      </div>

    </div>
  );
};

export default ImpactComparison;