# 🎥 PromptCam — AI-Style Teleprompter Camera

PromptCam is a **mobile-first teleprompter camera web application** designed to help users record videos confidently without forgetting their speech.

Simply paste your complete script, open the camera, and read the speech naturally while the teleprompter automatically scrolls on the screen.

Live Demo: https://promptcam-zeta.vercel.app/

## ✨ Features

* 📝 Paste your **complete speech/script**
* 📱 Mobile-first responsive interface
* 📷 Front-camera support
* 📜 Smooth teleprompter scrolling
* ⚡ Adjustable scrolling speed
* ▶️ Play / Pause controls
* 🔄 Reset teleprompter position
* 🎙️ Camera + microphone recording
* 🎬 Recorded video preview
* 💾 Save recorded video to device
* ⏱️ Recording timer
* 🔁 Record again option
* 🔒 Browser-based camera and microphone permissions

## 🛠️ Tech Stack

* **React**
* **TypeScript**
* **Vite**
* **CSS3**
* **MediaDevices API**
* **MediaRecorder API**
* **HTML5 Video**
* **JavaScript / TypeScript**

## 📂 Project Structure

```text
PromptCam/
│
├── public/
│
├── src/
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd promptcam
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL shown in the terminal.

For testing camera and microphone on a mobile device, use a secure HTTPS environment.

## 🎯 How It Works

```text
Paste Script
     ↓
Open Camera
     ↓
Teleprompter Displays Script
     ↓
Adjust Scrolling Speed
     ↓
Start Recording
     ↓
Camera + Microphone Capture
     ↓
Preview Recording
     ↓
Save Video
```

## 📱 Mobile Experience

PromptCam is designed primarily for smartphones, making it suitable for:

* 🎥 Instagram / YouTube videos
* 🎓 College presentations
* 💼 Professional introductions
* 📢 Content creation
* 🗣️ Speech and presentation practice
* 📹 Short-form video recording

## 🔐 Browser Permissions

PromptCam requires:

* Camera permission
* Microphone permission

These permissions are requested by the browser and are required for recording.

## ⚠️ Current Limitation

Because PromptCam runs as a web application, saving directly into a phone's gallery is controlled by the browser. The application provides a save/download flow for the recorded video.

Native gallery integration can be added in a future version using a mobile wrapper such as Capacitor.

## 🔮 Future Improvements

* 🤖 AI-powered script assistance
* 🎤 Voice-controlled teleprompter
* 👁️ Eye-contact detection
* 🧠 AI speech coaching
* 📊 Speaking analytics
* 🎨 More teleprompter themes
* 🔤 Font-size customization
* 📱 PWA support
* 📂 Direct native gallery integration
* 🤖 AI-based speech pacing and feedback

## 💡 Why PromptCam?

For many creators and students, remembering a complete speech while maintaining natural eye contact with the camera is difficult.

PromptCam combines a **teleprompter and camera recorder into one simple mobile-first application**, allowing users to focus on delivering their message instead of memorizing it.

## 👩‍💻 Developer

**Niharika Lakhera**

B.Tech — Artificial Intelligence

---

⭐ If you find PromptCam useful, consider giving the repository a star!
