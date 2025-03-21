# GPT-4o Chatbot Demo

A modern, responsive chat interface leveraging OpenAI's GPT-4o model with a beautiful UI built using Next.js, shadcn/ui, and Tailwind CSS.

## Features

- **Real-time Interaction** with GPT-4o model
- **Chat History** preservation within browser session
- **Beautiful Markdown Rendering** with syntax highlighting
- **Math Formula Rendering** via KaTeX
- **Dark/Light Mode** with automatic system preference detection
- **Responsive Design** that works across all devices
- **Keyboard Shortcuts** for power users

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Zustand** for state management
- **React Markdown** for rendering markdown
- **OpenAI API** integration with GPT-4o

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/gpt-4o-chatbot-demo.git
cd gpt-4o-chatbot-demo
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` to add your OpenAI API key.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Usage

- Type your message in the input field and press Enter or click the Send button
- Use Shift+Enter for line breaks
- Click the theme toggle to switch between light and dark mode
- Start a new conversation using the "New Chat" button
- View and select previous conversations in the sidebar

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for the amazing GPT-4o model
- [Next.js](https://nextjs.org/) for the React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
