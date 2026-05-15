from flask import Flask
from flask_cors import CORS
from routes.ai_routes import ai_bp
from routes.chat_routes import chat_bp
from extensions import socketio   
from routes.translation_routes import translation_bp


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ INIT SOCKETIO
socketio.init_app(app)

# Register routes
app.register_blueprint(ai_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(translation_bp)

@app.route("/")
def home():
    return {"status": "Backend Running 🚀"}

if __name__ == "__main__":
    socketio.run(app, debug=True)   # ✅ IMPORTANT (not app.run)