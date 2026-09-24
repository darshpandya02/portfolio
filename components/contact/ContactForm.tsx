"use client";

import { useState } from "react";
import { toast } from "sonner";

import { addMessage } from "@/actions/db";
import { MessageSchema, UserMessage } from "@/types/project";

const fieldClass =
  "w-full rounded border border-term-border bg-term-bg px-3 py-2 text-sm text-term-fg placeholder:text-term-faint focus:border-term-accent/70 focus:outline-none focus:ring-1 focus:ring-term-accent/40";

/** The contact form, dressed as an interactive `mail` session. */
export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    const message: UserMessage = {
      name: formData.get("fullName") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    const parsed = await MessageSchema.safeParseAsync(message);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => toast.error(issue.message, { duration: 3500 }));
      setLoading(false);
      return;
    }

    const response = await addMessage(message);
    if (response.status === 200) {
      toast.success("Message sent. I'll get back to you.", { duration: 4000 });
      setSent(true);
    } else {
      response.message.forEach((msg) => toast.error(msg, { duration: 4000 }));
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-term-green">✓ Message queued for delivery.</p>
        <p className="text-term-dim">
          It lands in my inbox directly. I answer most things within a couple of days.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="rounded border border-term-border bg-term-raised px-3 py-1.5 text-xs text-term-dim transition-colors hover:text-term-fg"
        >
          write another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await handleSubmit(new FormData(event.currentTarget));
      }}
      className="space-y-4 text-sm"
    >
      <p className="text-term-dim">
        <span className="text-term-accent">$</span> mail -s &quot;hello&quot; darsh
      </p>

      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-xs text-term-dim">
          From (name)
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          placeholder="Ada Lovelace"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs text-term-dim">
          Reply-To (email)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="ada@example.com"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-xs text-term-dim">
          Body
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="What are you working on?"
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-term-faint">Goes straight to my inbox. No newsletter, no CRM.</span>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 whitespace-nowrap rounded border border-term-accent/60 bg-term-accent/10 px-4 py-2 text-sm text-term-accent transition-colors hover:bg-term-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "sending…" : "send ⏎"}
        </button>
      </div>
    </form>
  );
}
