# 🤖 AI Chat Dashboard

An enterprise-grade, emotion-aware chat dashboard that combines real-time chat, AI insights, emotion detection, and feature toggle impact simulation.

## Features

### Use Case 1: Emotion-Aware Chat Dashboard
- **Conversations List**: Browse users with emotion indicators and last message preview
- **Real-time Chat Window**: Send/receive messages with emotion-triggered UI
- **AI Insights Panel**: Sentiment analysis, confidence scores, and suggested actions
- **Emotion-Based UI Adaptation**: Shows how UI changes for different emotions (frustrated, confused, positive)

### Use Case 2: Feature Toggle Impact Simulator
- **Feature Toggles**: Turn features ON/OFF (Sentiment Detection, Translation, Smart Suggestions, Auto Summarization)
- **Before/After Comparison**: See visual comparison of enabled vs disabled features
- **Impact Analysis**: View affected components, risk levels, and potential risks

## Project Structure

```
AI Chat Dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ConversationList.js
│   │   ├── ChatWindow.js
│   │   ├── AIInsights.js
│   │   ├── EmotionShowcase.js
│   │   ├── FeatureTogglePanel.js
│   │   ├── ImpactComparison.js
│   │   └── ImpactAnalysis.js
│   ├── App.js
│   ├── index.js
│   ├── styles.css
│   └── mockData.js
├── package.json
└── README.md
```

## Installation & Setup

### 1. Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### 2. Install Dependencies
```bash
cd "AI Chat Dashboard"
npm install
```

### 3. Start Development Server
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

## How to Use

### Use Case 1: Emotion-Aware Chat Dashboard
1. **Select a Conversation**: Click on any user in the left panel
2. **View Chat**: The center panel shows the conversation
3. **Send Messages**: Type and click "Send" or press Enter
4. **Observe AI Insights**: Right panel shows detected emotion and confidence
5. **Check Emotion Adaptation**: Far right panel shows UI changes for different emotions
6. **Use Quick Actions**: For frustrated users, red help panel appears with quick action buttons

### Use Case 2: Feature Toggle Simulator
1. **Switch Tabs**: Click "Use Case 2: Feature Toggle Simulator"
2. **Toggle Features**: Click toggle switches to enable/disable features
3. **View Impact**: 
   - Middle panel shows before/after comparison
   - Right panel shows affected components and risk levels

## Key Features

### Emotion Detection
- **Frustrated** (😡): Simplified UI, highlighted help actions, red theme
- **Confused** (😕): Step-by-step guidance, tooltips, suggestions
- **Positive** (😊): Minimal UI, faster interaction, clean experience

### Smart UI Adaptation
- Real-time emotion banners
- Conditional help panels
- Theme switching based on sentiment
- Dynamic component visibility

### Feature Impact Analysis
- Risk level calculation (Low/Medium/High)
- Affected areas mapping (UI, Services, Data Flow)
- Before/After scenario simulation
- Potential risks assessment

## Mock Data

The dashboard includes mock conversations for 5 users:
- **John Smith** (Frustrated): Order tracking issue
- **Sarah Johnson** (Positive): Satisfied customer
- **Mike Chen** (Confused): Feature usage question
- **Lisa Anderson** (Positive): General inquiry
- **David Brown** (Frustrated): Wrong order received

## Technologies Used

- **React 18**: UI framework with hooks
- **CSS3**: Styling with responsive design
- **JavaScript ES6+**: Modern JavaScript features

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Add More Users
Edit `src/mockData.js` and add to `mockUsers` array

### Modify AI Insights
Update `mockAIInsights` in `src/mockData.js`

### Add More Features
Edit `mockFeatures` in `src/mockData.js`

### Change Colors & Styling
Modify `src/styles.css` for custom theming

## Performance Optimization

- Component-based architecture for reusability
- Minimal re-renders with React hooks
- CSS animations for smooth transitions
- Responsive scrolling in message container

## Future Enhancements

- WebSocket integration for real-time messaging
- Backend API integration
- User authentication
- Persistent data storage
- Advanced NLP for sentiment analysis
- Multi-language support
- Analytics dashboard

## License

MIT Licensed

---

**Created**: April 2026
**Version**: 1.0.0
