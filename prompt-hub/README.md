# LLM Agent Template Hub

A modern, beautiful web application for managing and discovering AI prompts, templates, and agent configurations. Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## ✨ Features

- **Beautiful UI**: Modern, responsive design with gradient backgrounds and smooth animations
- **Search & Filter**: Powerful search functionality with category-based filtering
- **Command Palette**: Quick access to all prompts with Cmd/Ctrl+K shortcut
- **Prompt Management**: View, preview, and copy prompts with ease
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **TypeScript**: Full type safety throughout the application
- **Modern Stack**: Built with the latest Next.js App Router and React 18

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand
- **Validation**: Zod
- **Markdown Processing**: gray-matter, remark, rehype
- **Syntax Highlighting**: shiki
- **Search**: FlexSearch
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prompt-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
prompt-hub/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── command-palette.tsx
│   │   ├── header.tsx
│   │   ├── prompt-card.tsx
│   │   └── search-filters.tsx
│   ├── lib/               # Utility functions
│   │   ├── prompts.ts     # Prompt loading logic
│   │   └── utils.ts       # shadcn/ui utilities
│   ├── store/             # State management
│   │   └── prompt-store.ts
│   └── types/             # TypeScript types
│       └── prompt.ts
├── prompts/               # Prompt markdown files
├── public/                # Static assets
└── package.json
```

## 🎯 Key Components

### Command Palette
- **Shortcut**: Cmd/Ctrl+K
- **Features**: Search prompts, quick copy, preview
- **Usage**: Press the shortcut or click the search button

### Prompt Cards
- **Display**: Title, description, category, tags
- **Actions**: Preview prompt, quick copy
- **Responsive**: Adapts to different screen sizes

### Search & Filters
- **Search**: Real-time search through titles, descriptions, and tags
- **Categories**: Filter by prompt categories
- **Results**: Dynamic result count and filtering

## 🔧 Configuration

### Adding New Prompts
1. Create a new markdown file in the `prompts/` directory
2. Follow the existing prompt format
3. The app will automatically load and display new prompts

### Customizing Styles
- Modify `src/app/globals.css` for global styles
- Update Tailwind configuration in `tailwind.config.ts`
- Customize shadcn/ui theme in `components.json`

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full grid layout with hover effects
- **Tablet**: Adaptive grid with touch-friendly interactions
- **Mobile**: Single-column layout with optimized spacing

## 🎨 Customization

### Colors
- Primary gradient: Blue to Purple
- Background: Dark slate with blue accents
- Cards: Semi-transparent white with backdrop blur

### Animations
- Smooth hover effects on cards
- Staggered fade-in animations
- Smooth transitions for all interactions

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms
- **Netlify**: Build command: `npm run build`
- **Railway**: Use the Next.js template
- **Docker**: Build and deploy as a container

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Reach out to the maintainers

---

Built with ❤️ using modern web technologies
