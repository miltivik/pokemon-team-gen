"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analytics } from "@/lib/analytics";
import type {
  BugReportGenerationContext,
  BugReportPayload,
} from "@/lib/bug-report";
import { useTranslation } from "@/lib/i18n";

interface BugReportDialogProps {
  generationContext?: BugReportGenerationContext;
  trigger: ReactNode;
}

const COPY = {
  en: {
    title: "Report a bug",
    description:
      "Describe what happened and we will receive the current generation context automatically.",
    issueTitle: "Short title",
    issueTitlePlaceholder: "Example: Trick Room teams are missing setters",
    issueDescription: "What happened?",
    issueDescriptionPlaceholder:
      "Explain the problem, what you expected, and what the generator actually returned.",
    issueSteps: "Steps to reproduce",
    issueStepsPlaceholder:
      "1. Choose format...\n2. Enable filter...\n3. Generate team...\n4. Observe the issue...",
    issueEmail: "Email for follow-up (optional)",
    issueEmailPlaceholder: "you@example.com",
    issueContext: "Attached context",
    issueContextSummary:
      "We will include your current team and generation options with the report.",
    issueContextFormat: "format",
    issueContextTemplate: "template",
    issueContextTeamSuffix: "Pokemon attached",
    issueCancel: "Cancel",
    issueSubmit: "Send report",
    issueSending: "Sending...",
    issueSuccess: "Bug report sent",
    issueSuccessDesc: "Thanks. The report was delivered successfully.",
    issueFailure: "Could not send the bug report",
    issueFailureDesc:
      "Please try again in a moment or use the contact email instead.",
  },
  es: {
    title: "Reportar un bug",
    description:
      "Describe que paso y recibiremos automaticamente el contexto actual de generacion.",
    issueTitle: "Titulo corto",
    issueTitlePlaceholder:
      "Ejemplo: los equipos de Trick Room salen sin setters",
    issueDescription: "Que paso?",
    issueDescriptionPlaceholder:
      "Explica el problema, que esperabas y que devolvio realmente el generador.",
    issueSteps: "Pasos para reproducir",
    issueStepsPlaceholder:
      "1. Elegir formato...\n2. Activar filtro...\n3. Generar equipo...\n4. Ver el problema...",
    issueEmail: "Email para seguimiento (opcional)",
    issueEmailPlaceholder: "tu@email.com",
    issueContext: "Contexto adjunto",
    issueContextSummary:
      "Incluiremos tu equipo actual y las opciones de generacion con el reporte.",
    issueContextFormat: "formato",
    issueContextTemplate: "estilo",
    issueContextTeamSuffix: "Pokemon adjuntos",
    issueCancel: "Cancelar",
    issueSubmit: "Enviar reporte",
    issueSending: "Enviando...",
    issueSuccess: "Reporte enviado",
    issueSuccessDesc: "Gracias. El reporte se envio correctamente.",
    issueFailure: "No se pudo enviar el reporte",
    issueFailureDesc:
      "Intenta de nuevo en un momento o usa el email de contacto.",
  },
} as const;

function getErrorMessage(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object") return null;

  const errorValue = Reflect.get(responseBody, "error");
  return typeof errorValue === "string" ? errorValue : null;
}

export function BugReportDialog({
  generationContext,
  trigger,
}: BugReportDialogProps) {
  const pathname = usePathname();
  const { lang } = useTranslation();
  const copy = lang === "es" ? COPY.es : COPY.en;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const contextSummary = useMemo(() => {
    if (!generationContext) return null;

    const bits = [
      generationContext.format
        ? `${copy.issueContextFormat} ${generationContext.format}`
        : null,
      generationContext.templateId
        ? `${copy.issueContextTemplate} ${generationContext.templateId}`
        : null,
      generationContext.team?.length
        ? `${generationContext.team.length} ${copy.issueContextTeamSuffix}`
        : null,
    ].filter(Boolean);

    return bits.join(" · ");
  }, [copy, generationContext]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setStepsToReproduce("");
    setEmail("");
    setHoneypot("");
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen);

    if (nextOpen) {
      analytics.reportBugOpened(pathname || "/unknown");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: BugReportPayload = {
      title,
      description,
      stepsToReproduce,
      email,
      page: pathname || "/unknown",
      lang,
      clientMeta: {
        userAgent:
          typeof window !== "undefined" ? window.navigator.userAgent : "",
        submittedAt: new Date().toISOString(),
        currentUrl:
          typeof window !== "undefined" ? window.location.href : undefined,
      },
      generationContext,
      honeypot,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/report-bug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(getErrorMessage(responseBody) ?? copy.issueFailureDesc);
      }

      analytics.reportBugSubmitted(pathname || "/unknown");
      toast.success(copy.issueSuccess, {
        description: copy.issueSuccessDesc,
      });
      resetForm();
      setIsOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : copy.issueFailureDesc;

      analytics.reportBugFailed(pathname || "/unknown");
      toast.error(copy.issueFailure, {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="bug-title">{copy.issueTitle}</Label>
            <Input
              id="bug-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={copy.issueTitlePlaceholder}
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-description">{copy.issueDescription}</Label>
            <Textarea
              id="bug-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={copy.issueDescriptionPlaceholder}
              rows={5}
              maxLength={4000}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-steps">{copy.issueSteps}</Label>
            <Textarea
              id="bug-steps"
              value={stepsToReproduce}
              onChange={(event) => setStepsToReproduce(event.target.value)}
              placeholder={copy.issueStepsPlaceholder}
              rows={5}
              maxLength={4000}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-email">{copy.issueEmail}</Label>
            <Input
              id="bug-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={copy.issueEmailPlaceholder}
              maxLength={254}
            />
          </div>

          <div className="hidden" aria-hidden="true">
            <Label htmlFor="bug-company">Company</Label>
            <Input
              id="bug-company"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>

          {generationContext && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {copy.issueContext}
              </p>
              <p>{copy.issueContextSummary}</p>
              {contextSummary && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {contextSummary}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              {copy.issueCancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? copy.issueSending : copy.issueSubmit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
