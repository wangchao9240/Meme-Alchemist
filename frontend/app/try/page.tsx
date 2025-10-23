"use client"

import { useState } from "react"
import {
  ArrowLeft,
  RefreshCw,
  Home,
  TrendingUp,
  PlusCircle,
  User,
} from "lucide-react"
import { TrendSelector } from "@/components/composer/TrendSelector"
import { FactPicker } from "@/components/composer/FactPicker"
import { TemplateGrid } from "@/components/composer/TemplateGrid"
import { MemeViewer } from "@/components/viewer/MemeViewer"
import { useComposerStore } from "@/lib/stores/composer"

export default function TryPage() {
  const [step, setStep] = useState<"topic" | "facts" | "template" | "result">(
    "topic"
  )
  const { topic, facts, template, result } = useComposerStore()

  const stepTitles = {
    topic: "Select a Trend",
    facts: "Pick Facts",
    template: "Choose Template",
    result: "Your Meme",
  }

  const handleBack = () => {
    if (step === "facts") setStep("topic")
    else if (step === "template") setStep("facts")
    else if (step === "result") setStep("template")
  }

  const handleRefresh = () => {
    // Refresh logic based on current step
    if (step === "topic") {
      // Refresh trends
      window.location.reload()
    }
  }

  return (
    <div
      className="relative flex h-screen w-full flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--background-dark)",
        color: "var(--on-surface-dark)",
      }}
    >
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 pt-4 pb-6 shrink-0 safe-area-inset-top"
          style={{ backgroundColor: "var(--background-dark)" }}
        >
          <button
            onClick={handleBack}
            aria-label="Back"
            className="flex size-10 items-center justify-center touch-manipulation"
            style={{
              opacity: step === "topic" ? 0.3 : 1,
              pointerEvents: step === "topic" ? "none" : "auto",
            }}
          >
            <ArrowLeft size={24} style={{ color: "var(--on-surface-dark)" }} />
          </button>

          <h1
            className="text-xl font-bold leading-tight"
            style={{ color: "var(--on-surface-dark)" }}
          >
            {stepTitles[step]}
          </h1>

          <button
            onClick={handleRefresh}
            aria-label="Refresh"
            className="flex size-10 items-center justify-center touch-manipulation"
            style={{
              opacity: step === "topic" ? 1 : 0.3,
              pointerEvents: step === "topic" ? "auto" : "none",
            }}
          >
            <RefreshCw size={24} style={{ color: "var(--on-surface-dark)" }} />
          </button>
        </header>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {step === "topic" && (
            <TrendSelector
              onNext={(selectedTopic) => {
                useComposerStore.setState({ topic: selectedTopic })
                setStep("facts")
              }}
              onBack={handleBack}
            />
          )}

          {step === "facts" && (
            <FactPicker
              topic={topic}
              onNext={(selectedFacts) => {
                useComposerStore.setState({ facts: selectedFacts })
                setStep("template")
              }}
              onBack={() => setStep("topic")}
            />
          )}

          {step === "template" && (
            <TemplateGrid
              onNext={(selectedTemplate) => {
                useComposerStore.setState({ template: selectedTemplate })
                setStep("result")
              }}
              onBack={() => setStep("facts")}
            />
          )}

          {step === "result" && (
            <MemeViewer
              result={result}
              onReset={() => {
                useComposerStore.getState().reset()
                setStep("topic")
              }}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-10 border-t safe-area-inset-bottom"
        style={{
          backgroundColor: "rgba(28, 24, 37, 0.8)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <nav className="flex justify-around items-center h-20">
          <NavItem icon={Home} label="Home" href="/" />
          <NavItem
            icon={TrendingUp}
            label="Trending"
            href="/try"
            active={true}
          />
          <NavItem icon={PlusCircle} label="Create" href="/try" />
          <NavItem icon={User} label="Profile" href="/profile" />
        </nav>
      </footer>
    </div>
  )
}

interface NavItemProps {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

function NavItem({ icon: Icon, label, href, active = false }: NavItemProps) {
  return (
    <a
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center gap-1 touch-manipulation min-h-[48px] min-w-[56px] justify-center"
      style={{
        color: active ? "var(--primary)" : "var(--on-surface-variant-dark)",
      }}
    >
      {active ? (
        <div
          className="rounded-full px-7 py-1.5 mb-1"
          style={{ backgroundColor: "var(--primary-container)" }}
        >
          <Icon size={24} style={{ color: "var(--on-primary-container)" }} />
        </div>
      ) : (
        <Icon size={24} />
      )}
      <span
        className={`text-xs ${active ? "font-bold" : "font-medium"}`}
        style={{
          color: active ? "var(--primary)" : "var(--on-surface-variant-dark)",
        }}
      >
        {label}
      </span>
    </a>
  )
}
