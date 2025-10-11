# 📘 Vaathi – AI-Powered Study Companion  

Vaathi is a lightweight web app built during **Hacktoberfest Hackathon**. It helps students **learn faster and smarter** by generating **AI-powered study guides** and **personalized learning roadmaps**.  

---

## ✨ Features
- **AI-Generated Study Guides**  
  Enter a topic and instantly get a plain-language explanation + 3 quiz questions.  

- **Custom Learning Roadmaps**  
  Input your goal, current skills, and weekly availability → get a week-by-week plan with study/practice balance, resources, and self-assessment tasks.  

- **Simple UI**  
  Built with **React + TailwindCSS** for a clean, responsive interface.  

- **Backend API**  
  Built with **Node.js + Express**, connects to AI models (Gemini / Claude / OpenAI) but also includes **local fallback generation** so the app works even without internet keys.  

---

## 🚀 Tech Stack
- **Frontend**: React (Vite), TailwindCSS  
- **Backend**: Node.js, Express  
- **AI Integration**: Google Gemini API (via REST), with fallback to local generators for guaranteed demo  
- **Deployment-ready**: Backend can run on DigitalOcean / Render / Railway, Frontend on Netlify / Vercel  

---

## 🛠️ How It Works
1. User enters a **topic** → backend calls Gemini (or fallback) → returns JSON → frontend renders explanation + quiz.  
2. User enters **goal + skills + time commitment** → backend calls Gemini (or fallback) → returns JSON roadmap → frontend displays weekly plan.  
3. If AI API is unavailable, EduMind gracefully switches to a **deterministic local fallback** (ensures the demo never breaks).  

---

## 📦 Setup & Run

### 1. Clone & Install
```bash
git clone <your-repo>
cd edumind
npm install   # for React frontend
```
### 2.Backend Setup
```bash
cd server
npm install
Create .env in server/:
PORT=5000
# Use any available AI key (Gemini, Claude, or leave blank for mock)
GOOGLE_API_KEY=your-key-here
Run backend: npm index.js
```
## 📊 Example Usage
```bash
{
  "topic": "Photosynthesis",
  "explanation": "Photosynthesis is the process plants use to convert sunlight into energy...",
  "quiz": [
    {"q":"What is photosynthesis?","a":"A process by which plants make food from sunlight."},
    {"q":"Which gas is consumed?","a":"Carbon dioxide."},
    {"q":"Which gas is released?","a":"Oxygen."}
  ]
}
```


## Screenshots  
<img width="1920" height="1080" alt="Screenshot (1716)" src="https://github.com/user-attachments/assets/e2ffae59-1bf4-4a9c-8ba2-04a7aa424b0a" />
<img width="1920" height="1080" alt="Screenshot (1719)" src="https://github.com/user-attachments/assets/46a6f227-ada4-4dca-a5d2-b3cd680aabb6" />
<img width="1920" height="1080" alt="Screenshot (1717)" src="https://github.com/user-attachments/assets/7f8309ad-69bd-47d4-822c-026bd2b1d0c8" />

<img width="1920" height="1080" alt="Screenshot (1718)" src="https://github.com/user-attachments/assets/0d8741a2-27e1-44c7-ae84-6b21e8df8f2a" />


## Loved the project 💖? 
  
  If you found the project interesting, then please do give this project a star ⭐. 
  <br> <br> <br>
   <p align="center" width="100%">
   Made with 💖 by Harshit Aditya   
</p>
