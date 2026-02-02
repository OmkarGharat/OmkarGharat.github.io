# 📔 Digital Garden Operator's Manual

Welcome back, Omkar! This guide is your "Time Capsule." It explains exactly how this blog works, so you can manage it even years from now.

---

## 🚀 Quick Start (Local Development)

To write, edit, or preview your blog on your computer:

1.  Open this folder in **VS Code**.
2.  Open the terminal (Ctrl + `).
3.  Run the command:
    ```powershell
    npm start
    ```
4.  Open your browser to: `http://localhost:50171`

---

## ✍️ How to Write & Edit

I have built a **Local CMS** for you so you don't have to touch code to blog.

### 1. Creating a New Page
- Click the **`+ New Page`** button at the bottom right (only visible locally).
- Enter your **Title** (e.g., "My Future Vision").
- Select a **Category** (Blog, Projects, etc.).
- The system will automatically create the file and add it to the sidebar.

### 2. Editing an Existing Page
- Navigate to the page you want to change.
- Click the **`📝 Edit this Page`** button.
- Write comfortably. The editor uses a **Notion-like visual style** (Instant Rendering), so you don't see raw Markdown symbols—what you type is what you get.
- Click **`Save & Close`**.

---

## 🌐 Making it Live (Publishing)

When you are done writing locally, you must "Push" your changes to GitHub to show the world.

1.  Stop the server in the terminal (Ctrl + C).
2.  Run these three commands:
    ```powershell
    git add .
    git commit -m "Add new blog post"
    git push origin main
    ```
3.  Wait 1 minute, and your site will be live at `https://omkargharat.github.io`.

---

## 📂 Folder Structure Breakdown

- **`/blog/posts/`**: Where your actual blog articles (.md files) live.
- **`/guides/`**: This documentation and other helpful notes.
- **`index.html`**: The "Heart" of the site. Contains the Docsify config, Vditor editor, and CMS UI logic.
- **`style.css`**: The "Skin" of the site. Controls the premium dark theme.
- **`cms-server.js`**: The "Brain." It handles the Local CMS and auto-generates your sidebar.
- **`.nojekyll`**: **CRITICAL.** Do not delete. This tells GitHub to show files that start with underscores.

---

## 🛠 Troubleshooting

### Editor looks weird or has giant icons?
If the editor UI seems broken, try a **Hard Refresh** of the page (hold `Shift` and click the browser Refresh button) to clear old styles.

### Port Busy Error
If you get an `EADDRINUSE` error when running `npm start`, don't worry! The server is smart and will automatically try the next available port (50172, 50173, etc.). Just check the terminal for the current link.

### Sidebar not updating
The sidebar updates every time the server starts or whenever you save a page. If it looks stuck, just restart the server using `npm start`.

---

## 💡 Future Omkar's Tip
This site is built with **Docsify**. It doesn't use a database; it just reads Markdown files. As long as you have your `.md` files, your content is safe forever!

> *"Plant ideas, grow knowledge."*
