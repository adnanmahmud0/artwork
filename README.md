# Little Gallery — AI Artwork Studio

This is a prototype web application that allows users to upload photos of a child's artwork and use OpenAI's generative AI to create a completely new, rich, and imaginative gallery-ready art piece based on the uploaded style and themes.

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **OpenAI API Key**

## Local Setup

1. **Clone or Download the Repository**
   Make sure all files (`server.js`, `package.json`, `artwork-gallery-prototype.html`, etc.) are in your project folder.

2. **Install Dependencies**
   Open a terminal in the project folder and run:
   ```bash
   npm install
   ```

3. **Set your OpenAI API Key**
   The application uses a `.env` file to securely load your API key. Create a new file named `.env` in the project folder and add your key like this:
   ```env
   OPENAI_API_KEY="sk-your-api-key-here"
   ```

4. **Start the Server**
   Run the following command to start the Express server:
   ```bash
   node server.js
   ```

5. **Open the App**
   Open your browser and navigate to:
   [http://localhost:3000/artwork-gallery-prototype.html](http://localhost:3000/artwork-gallery-prototype.html)

---

## Deployment (Hostinger Business Web Hosting)

To deploy this Node.js app on Hostinger's hPanel:

1. **Zip the Files**
   Create a `.zip` file of the project. **Do not include the `node_modules` folder**. The zip should contain `server.js`, `package.json`, `artwork-gallery-prototype.html`, and any asset folders.

2. **Upload to Hostinger**
   - Go to **Files > File Manager** in hPanel.
   - Create a folder for your app (preferably outside `public_html`).
   - Upload and extract the `.zip` file into this folder.

3. **Setup Node.js App**
   - In hPanel, go to **Advanced > Node.js**.
   - Click **Create Application**.
   - Set **Application Root** to the folder you extracted the files into.
   - Set **Application URL** to your desired domain/subdomain.
   - Set **Application Startup File** to `server.js`.

4. **Set Environment Variables**
   - In the Node.js application settings, add a new Environment Variable:
     - **Name:** `OPENAI_API_KEY`
     - **Value:** `sk-your-real-api-key-here`

5. **Install and Start**
   - Click **NPM Install** in the Hostinger panel to install the required packages.
   - Click **Start App**. 
   - Your app is now live!
