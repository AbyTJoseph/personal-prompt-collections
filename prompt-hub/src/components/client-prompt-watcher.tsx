'use client';

import dynamic from 'next/dynamic';

// Dynamically import the PromptWatcher component with no SSR
const PromptWatcher = dynamic(() => import("@/components/prompt-watcher"), { 
  ssr: false 
});

export default function ClientPromptWatcher() {
  return <PromptWatcher />;
}
