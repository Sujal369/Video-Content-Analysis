from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_pymongo import PyMongo
from bson import ObjectId
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from functools import wraps
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from transformers import pipeline
import time
import logging
import yt_dlp
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

# MongoDB Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/video_analyzer")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "your-secret-key")
mongo = PyMongo(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize sentiment analysis pipeline
sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

# Configure Google Generative AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")

def get_video_metadata(url):
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            video_info = ydl.extract_info(url, download=False)
            metadata = {
                'title': video_info.get('title', 'No title found'),
                'author': video_info.get('uploader', 'No author found'),
                'description': video_info.get('description', 'No description found'),
                'views': video_info.get('view_count', 'No view count found'),
                'likes': video_info.get('like_count', 'No like count found'),
                'subscribers': video_info.get('channel_follower_count', 'No subscribers found') 
            }
            return metadata
        except Exception as e:
            raise ValueError(f"Error fetching video metadata: {e}")

def generate_youtube_titles(video_url):
    """Fetches video metadata and generates AI-based YouTube title suggestions, summary, and improvement tips."""
    video_title, video_niche = extract_video_metadata(video_url)
    metadata = get_video_metadata(video_url)

    # Construct AI prompt for title suggestions
    title_prompt = f"""
    Generate 10 catchy and engaging YouTube title suggestions for a video with:
    - Title: {video_title}
    - Category/Niche: {video_niche}
    """

    # Construct AI prompt for video summary and improvement tips
    summary_prompt = f"""
    Analyze the following YouTube video metadata and provide a detailed summary and improvement suggestions:
    - Title: {metadata['title']}
    - Views: {metadata['views']}
    - Likes: {metadata['likes']}
    - Subscribers: {metadata['subscribers']}
    - Niche: {video_niche}
    - Description: {metadata['description']}

    Provide:
    1. A concise summary of the video's performance and content.
    2. Key points on how to improve the video's engagement and reach.
    3. Suggestions for optimizing the video's title, description, and tags.
    And give short and simple also dont used * and # give the simple text.
    """

    # Generate title suggestions
    title_response = model.generate_content(title_prompt)
    ai_title_text = title_response.text if title_response.text else "No titles generated."
    titles = [line.strip("-•1234567890. ") for line in ai_title_text.split("\n") if len(line) > 5]

    # Generate summary and improvement suggestions
    summary_response = model.generate_content(summary_prompt)
    ai_summary_text = summary_response.text if summary_response.text else "No summary generated."

    return {
        "title_suggestions": titles[:10],
        "summary": ai_summary_text
    }

def extract_video_metadata(video_url):
    """Extracts video title and category from a YouTube URL using yt_dlp."""
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'extract_flat': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(video_url, download=False)
            video_title = info.get("title", "Unknown Title")
            categories = info.get("categories", ["General"])
            video_niche = categories[0] if categories else "General"
        except Exception as e:
            print(f"Error fetching video metadata: {e}")
            return "Unknown Title", "General"

    return video_title, video_niche

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.db.users.find_one({"_id": ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'Token is invalid!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
        except Exception as e:
            return jsonify({'message': 'An error occurred while decoding the token!', 'error': str(e)}), 500
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/analyze', methods=['POST'])
@token_required
def analyze_video(current_user):
    driver = None
    try:
        video_url = request.json.get('videoUrl')
        if not video_url:
            return jsonify({"error": "No video URL provided"}), 400

        # Get metadata
        try:
            metadata = get_video_metadata(video_url)
        except Exception as e:
            logging.error(f"Error getting metadata: {e}")
            metadata = None

        # Generate title suggestions and summary
        title_summary_data = generate_youtube_titles(video_url)
        title_suggestions = title_summary_data["title_suggestions"]
        summary = title_summary_data["summary"]

        # Set up Selenium WebDriver
        service = Service(ChromeDriverManager().install())
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless")
        driver = webdriver.Chrome(service=service, options=chrome_options)

        logging.info("Opening video URL in browser...")
        driver.get(video_url)
        time.sleep(5)

        # Scroll to load comments
        logging.info("Scrolling to load comments...")
        for _ in range(3):
            driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
            time.sleep(3)

        # Fetch comments
        comments_elements = driver.find_elements(By.XPATH, '//*[@id="content-text"]')
        comments = [comment.text for comment in comments_elements]

        if not comments:
            return jsonify({
                "success": False, 
                "error": "No comments found",
                "metadata": metadata,
                "title_suggestions": title_suggestions,
                "summary": summary
            })

        # Limit comments for analysis
        comments = comments[:50]
        logging.info(f"Fetched {len(comments)} comments.")

        # Analyze sentiment
        logging.info("Analyzing sentiment...")
        positive, negative, neutral = 0, 0, 0
        sentiment_results = []

        for comment in comments:
            result = sentiment_analyzer(comment)[0]
            stars = int(result["label"][0])  # Extracts the first character as the star rating (1-5)
            
            # Map star ratings to sentiment
            if stars >= 4:
                sentiment = "POSITIVE"
                positive += 1
            elif stars == 3:
                sentiment = "NEUTRAL"
                neutral += 1
            else:
                sentiment = "NEGATIVE"
                negative += 1

            sentiment_results.append({"text": comment, "sentiment": sentiment, "confidence": round(result["score"], 2)})

        # Calculate distribution
        total_comments = len(comments)
        sentiment_distribution = [
            {"sentiment": "Positive", "value": round((positive / total_comments) * 100, 2)},
            {"sentiment": "Negative", "value": round((negative / total_comments) * 100, 2)},
            {"sentiment": "Neutral", "value": round((neutral / total_comments) * 100, 2)},
        ]

        # Save analysis to database
        analysis_data = {
            "user_id": current_user["_id"],
            "video_url": video_url,
            "sentiment_distribution": sentiment_distribution,
            "top_comments": sentiment_results[:10],
            "metadata": metadata,
            "title_suggestions": title_suggestions,
            "summary": summary,
            "created_at": datetime.utcnow()
        }
        mongo.db.analysis.insert_one(analysis_data)

        return jsonify({
            "success": True,
            "sentimentDistribution": sentiment_distribution,
            "topComments": sentiment_results[:10],
            "metadata": metadata,
            "title_suggestions": title_suggestions,
            "summary": summary
        })

    except Exception as e:
        logging.error(f"Error occurred: {e}")
        return jsonify({"error": "An error occurred while processing the request.", "details": str(e)}), 500
    finally:
        if driver:
            driver.quit()

# User Authentication Routes
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        existing_user = mongo.db.users.find_one({"email": data["email"]})
        
        if existing_user:
            return jsonify({"error": "Email already exists"}), 400
        
        hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        user = {
            "username": data["username"],
            "email": data["email"],
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }
        
        result = mongo.db.users.insert_one(user)
        user["_id"] = str(result.inserted_id)
        
        token = jwt.encode(
            {"user_id": str(result.inserted_id), "exp": datetime.utcnow() + timedelta(days=30)},
            app.config["SECRET_KEY"]
        )
        
        return jsonify({
            "token": token,
            "user": {
                "id": str(result.inserted_id),
                "username": user["username"],
                "email": user["email"]
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.json
        user = mongo.db.users.find_one({"email": data["email"]})
        
        if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
            return jsonify({"error": "Invalid credentials"}), 401
        
        token = jwt.encode(
            {"user_id": str(user["_id"]), "exp": datetime.utcnow() + timedelta(days=30)},
            app.config["SECRET_KEY"]
        )
        
        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"]
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/verify", methods=["GET"])
@token_required
def verify_token(current_user):
    return jsonify({
        "user": {
            "id": str(current_user["_id"]),
            "username": current_user["username"],
            "email": current_user["email"]
        }
    })

@app.route("/api/auth/logout", methods=["POST"])
@token_required
def logout(current_user):
    # In a more complex system, you might want to invalidate the token here
    return jsonify({"message": "Successfully logged out"})

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.json
        user = mongo.db.users.find_one({"email": data["email"]})
        
        if not user:
            return jsonify({"error": "Email not found"}), 404
        
        # Generate password reset token
        reset_token = jwt.encode(
            {"user_id": str(user["_id"]), "exp": datetime.utcnow() + timedelta(hours=1)},
            app.config["SECRET_KEY"]
        )
        
        # Store reset token in database
        mongo.db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"reset_token": reset_token}}
        )
        
        # In a real application, send email with reset link
        # For now, just return success
        return jsonify({"message": "Password reset instructions sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.json
        token = data["token"]
        new_password = data["password"]
        
        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            user_id = payload["user_id"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Reset token has expired"}), 400
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid reset token"}), 400
        
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user or user.get("reset_token") != token:
            return jsonify({"error": "Invalid reset token"}), 400
        
        # Update password and remove reset token
        hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")
        mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {"password": hashed_password},
                "$unset": {"reset_token": ""}
            }
        )
        
        return jsonify({"message": "Password reset successful"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/detailed-analysis", methods=["GET"])
@token_required
def get_detailed_analysis(current_user):
    try:
        user_id = current_user["_id"]
        # Fetch user-specific analysis data
        analysis_data = list(mongo.db.analysis.find({"user_id": user_id}).sort("created_at", -1).limit(10))
        
        # Convert ObjectId to string for JSON serialization
        for analysis in analysis_data:
            analysis["_id"] = str(analysis["_id"])
            analysis["user_id"] = str(analysis["user_id"])
        
        return jsonify({
            "success": True,
            "data": analysis_data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/delete-analysis/<analysis_id>", methods=["DELETE"])
@token_required
def delete_analysis(current_user, analysis_id):
    try:
        # Ensure the analysis belongs to the current user
        analysis = mongo.db.analysis.find_one({"_id": ObjectId(analysis_id), "user_id": current_user["_id"]})
        if not analysis:
            return jsonify({"error": "Analysis not found or unauthorized"}), 404

        # Delete the analysis
        mongo.db.analysis.delete_one({"_id": ObjectId(analysis_id)})
        return jsonify({"success": True, "message": "Analysis deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

