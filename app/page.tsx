import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-4">Multi-Agent System Demo</h1>
          <p className="text-gray-600 mb-6">Choose an AI system to interact with:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          <Link href="/healthcare" className="group">
            <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="text-4xl mb-3">🏥</div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">Unified Healthcare System</h2>
              <p className="text-gray-600 text-sm">
                Complete healthcare solution with AI chat and interactive mapping. 
                Location-aware recommendations, weather integration, hospital finder, and multi-agent healthcare assistance all in one place.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">💬</span>AI Healthcare Chat
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">🗺️</span>Hospital Map & Weather
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">📍</span>Location Intelligence
                </div>
              </div>
              <div className="mt-3 text-blue-600 text-sm font-medium">
                Access healthcare system →
              </div>
            </div>
          </Link>
          
          <Link href="/agent" className="group">
            <div className="p-6 border border-gray-200 rounded-lg hover:border-green-400 hover:shadow-lg transition-all">
              <div className="text-4xl mb-3">🤖</div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-green-600">General Agent</h2>
              <p className="text-gray-600 text-sm">
                OpenAI Agent with RAG capabilities using Vectorize.io. 
                General purpose AI assistant with document retrieval and knowledge base integration.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">🧠</span>RAG Knowledge Base
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">📚</span>Document Retrieval
                </div>
              </div>
              <div className="mt-3 text-green-600 text-sm font-medium">
                Try general agent →
              </div>
            </div>
          </Link>

          <Link href="/agents-sdk" className="group">
            <div className="p-6 border border-gray-200 rounded-lg hover:border-purple-400 hover:shadow-lg transition-all">
              <div className="text-4xl mb-3">⚡</div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-purple-600">Agents SDK</h2>
              <p className="text-gray-600 text-sm">
                Advanced multi-agent system using OpenAI's Agents SDK. 
                Specialized agents working together for complex task resolution.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">🔧</span>Agent Orchestration
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">🎯</span>Specialized Tasks
                </div>
              </div>
              <div className="mt-3 text-purple-600 text-sm font-medium">
                Try agents SDK →
              </div>
            </div>
          </Link>
        </div>

        {/* System Architecture Info */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg w-full max-w-5xl">
          <h3 className="text-lg font-semibold mb-3">🏗️ System Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Frontend (Next.js)</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• React components with TypeScript</li>
                <li>• Real-time location services</li>
                <li>• Interactive maps with Leaflet</li>
                <li>• Weather API integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Backend (Python FastAPI)</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• OpenAI Agents SDK v0.0.19</li>
                <li>• Multi-agent healthcare system</li>
                <li>• Vectorize.io RAG integration</li>
                <li>• Firecrawl data scraping</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex flex-col gap-4 items-center justify-center">
        <div className="flex gap-[24px] flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to nextjs.org →
          </a>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
