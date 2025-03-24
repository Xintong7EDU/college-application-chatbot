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
- **Text-to-Speech** via Eleven Labs API

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Zustand** for state management
- **React Markdown** for rendering markdown
- **OpenAI API** integration with GPT-4o
- **Eleven Labs API** for text-to-speech

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- OpenAI API key
- Eleven Labs API key

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

Then edit `.env.local` to add your OpenAI API key and Eleven Labs API key:

```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_ELEVEN_LABS_API_KEY=your_eleven_labs_api_key_here
```

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
- Click the headphones icon next to assistant messages to hear the response using text-to-speech

## Development Guidelines

### Avoiding React Hydration Errors

When working with Next.js and React in a project that uses server-side rendering (SSR), it's important to avoid hydration mismatches. These occur when the HTML rendered on the server differs from what React tries to render on the client during hydration.

Common causes of hydration errors:

1. **Client-specific code not properly protected**: Always wrap client-only code in conditional checks or use client components properly.

2. **Dynamic content rendering differently**: Content that depends on browser-specific APIs, current time, or random values.

3. **Different component states**: Components that render differently based on client/server detection.

Best practices to prevent hydration errors:

- Use the `"use client"` directive at the top of files that use browser APIs.
- Always wrap client-side only elements in `useEffect` or check for `isClient` state:

```tsx
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

// Then render conditionally:
{isClient && <ClientOnlyComponent />}
```

- For elements that should appear in both server and client renders but with different visibility:
  - Use client state to control the content rather than just the visibility
  - Group related elements inside client-state-dependent rendering

- When using dates, ensure consistent formatting between server and client

- For environment variables needed on the client side, use the `NEXT_PUBLIC_` prefix

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for the amazing GPT-4o model
- [Next.js](https://nextjs.org/) for the React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Eleven Labs](https://elevenlabs.io/) for the text-to-speech API
