# 🚀 Quick Start Guide

## Step 1: Open Terminal
Open PowerShell and navigate to the project directory:
```powershell
cd "C:\Users\dsaic\OneDrive\Documents\AI Chat Dashboard"
```

## Step 2: Install Dependencies
```powershell
npm install
```

This will install all required packages (React, React-DOM, React-Scripts).

## Step 3: Start the Application
```powershell
npm start
```

The dashboard will automatically open in your default browser at `http://localhost:3000`

## What You'll See

### 🎯 Use Case 1: Chat Dashboard (Default View)
Shows 4 panels:
1. **Left Panel (22%)**: Conversation list with user emotions
   - 😊 Positive users
   - 😡 Frustrated users
   - 😕 Confused users

2. **Center Panel (40%)**: Chat window
   - Real-time message display
   - Emotion banners (high frustration alerts)
   - Quick action help panel for frustrated users
   - Message input box

3. **Right Panel 1 (19%)**: AI Insights
   - Detected emotion
   - Confidence score
   - Keywords detected
   - Suggested actions
   - Explanation

4. **Right Panel 2 (19%)**: Emotion Showcase
   - Shows UI adaptation for each emotion type
   - Frustrated, Confused, Positive states

### ⚙️ Use Case 2: Feature Toggle Simulator
Switch to this tab to see:
1. **Left Panel (25%)**: Feature toggles
   - Sentiment Detection
   - Translation
   - Smart Suggestions
   - Auto Summarization

2. **Middle Panel (37%)**: Before/After comparison
   - Shows enabled features (Before)
   - Shows disabled features (After)

3. **Right Panel (38%)**: Impact analysis
   - Risk level (Low/Medium/High)
   - Affected components
   - Potential risks

## Interactive Features

### Use Case 1 Interactions:
✅ Click different users to load their conversations
✅ Type and send messages
✅ Messages auto-scroll
✅ Emotion indicators update dynamically
✅ Help panel appears for frustrated users

### Use Case 2 Interactions:
✅ Click toggles to enable/disable features
✅ Before/After panel updates instantly
✅ Risk level changes based on disabled features
✅ Impact analysis updates automatically

## Sample Users to Try

| User | Emotion | Status | Message |
|------|---------|--------|---------|
| John Smith | 😡 Frustrated | Try this! | Order tracking issue |
| Sarah Johnson | 😊 Positive | Try this! | Satisfied customer |
| Mike Chen | 😕 Confused | Try this! | Feature usage question |

## Troubleshooting

### Port 3000 Already in Use?
```powershell
npm start -- --port 3001
```

### Need to Stop the Server?
Press `Ctrl + C` in the terminal

### Dependencies Install Issues?
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

## File Structure Explained

```
src/
├── App.js                    # Main component with tab logic
├── index.js                  # React entry point
├── styles.css               # All styling
├── mockData.js              # Mock conversations & users
└── components/
    ├── ConversationList.js  # Left panel - users list
    ├── ChatWindow.js        # Center panel - chat
    ├── AIInsights.js        # Right panel 1 - insights
    ├── EmotionShowcase.js   # Right panel 2 - emotion UI
    ├── FeatureTogglePanel.js # Case 2: toggles
    ├── ImpactComparison.js   # Case 2: before/after
    └── ImpactAnalysis.js     # Case 2: impact analysis
```

## Next Steps

1. **Try selecting different users** - See how UI adapts to emotions
2. **Send messages** - Test the chat functionality
3. **Toggle features** - See real-time impact analysis
4. **Explore styling** - Check out the CSS for customization ideas

## Tips

💡 The "frustrated" user (John Smith) shows the most features
💡 The dashboard is fully responsive
💡 All conversations are mocked data
💡 Messages appear with auto-scroll
💡 Emotion banners change color based on sentiment

Enjoy the AI Chat Dashboard! 🚀
