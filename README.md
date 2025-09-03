# React + Vite + Tailwind CSS

This project is a modern React application built with Vite and styled with Tailwind CSS.

## Features

- ⚛️ React 18 with hooks
- ⚡ Vite for fast development and building
- 🎨 Tailwind CSS for utility-first styling
- 🔥 Hot Module Replacement (HMR)
- 📦 ESLint for code quality

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173)

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── assets/          # Static assets
├── App.jsx          # Main App component (styled with Tailwind)
├── main.jsx         # Application entry point
└── index.css        # Tailwind CSS directives
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Tailwind CSS

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js` and the base styles are imported in `src/index.css`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
