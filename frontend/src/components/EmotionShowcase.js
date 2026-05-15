import React from 'react';
import { emotionEmojis } from '../emoji';

const EmotionShowcase = ({ currentEmotion }) => {
  const emotions = [
    {
      emotion: 'frustrated',
      emoji: emotionEmojis.frustrated,
      name: 'Frustrated',
      features: [
        'Simplified UI',
        'Highlighted help actions',
        'Red theme',
        'Priority support'
      ]
    },
    {
      emotion: 'confused',
      emoji: emotionEmojis.confused,
      name: 'Confused',
      features: [
        'Step-by-step guidance',
        'Helpful tooltips',
        'Suggestions panel',
        'Clearer interface'
      ]
    },
    {
      emotion: 'positive',
      emoji: emotionEmojis.positive,
      name: 'Positive',
      features: [
        'Minimal UI',
        'Faster interaction',
        'Clean experience',
        'Minimal distractions'
      ]
    }
  ];

  return (
    <div className="panel emotion-showcase-panel" style={{ flex: '0 1 14%', minWidth: '210px' }}>
      <h3 style={{ marginBottom: '15px', color: '#212529' }}>Emotion-Based UI</h3>
      
      <div className="emotion-showcase">
        {emotions.map(item => (
          <div
            key={item.emotion}
            className={`emotion-card ${currentEmotion === item.emotion ? 'active' : ''}`}
          >
            <div className="emotion-card-header">
              <span className="emotion-emoji">{item.emoji}</span>
              <span className="emotion-name">{item.name}</span>
            </div>
            <div className="emotion-features">
              {item.features.map((feature, idx) => (
                <div key={idx}>• {feature}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionShowcase;
