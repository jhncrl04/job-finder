"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin, Clock, X } from "lucide-react";
import Highlight from "@/components/Highlight";
import { cn, timeAgo, toneFor } from "@/lib/utils";
import { STATUSES, type Job, type Status } from "@/lib/types";

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  saved: "Saved",
  applied: "Applied",
  dismissed: "Dismissed",
};
const STATUS_ACTIVE: Record<Status, string> = {
  new: "bg-sky text-ink",
  saved: "bg-peach text-ink",
  applied: "bg-mint text-ink",
  dismissed: "bg-rose text-ink",
};

interface Props {
  job: Job;
  terms: string[];
  onClose: () => void;
  onStatus: (job: Job, next: Status) => void;
  onNotes: (job: Job, notes: string) => void;
}

export default function JobDrawer({ job, terms, onClose, onStatus, onNotes }: Props) {
  const [notes, setNotes] = useState(job.notes ?? "");
  const closeRef = useRef<HTMLButtonElement>(null);
  const link = job.apply_link ?? job.google_link;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={job.title}>
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[540px] animate-slide-in flex-col bg-white shadow-lift">
        <div className="flex items-start gap-3.5 border-b border-line p-5">
          <div
            aria-hidden="true"
            className={cn("grid size-12 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold", toneFor(job.company || job.title))}
          >
            {(job.company || job.title).trim().charAt(0).toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold leading-snug">
              <Highlight text={job.title} terms={terms} />
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">{job.company || "Company not listed"}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close details" className="icon-btn">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} /> {job.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={15} /> {timeAgo(job.posted_at)}
            </span>
          </div>

          <ul className="flex flex-wrap gap-1.5 empty:hidden">
            {job.is_remote && <li className="chip bg-mint-soft text-mint-deep">Remote</li>}
            {job.salary && <li className="chip bg-butter-soft text-butter-deep">{job.salary}</li>}
            {job.employment_type && (
              <li className="chip bg-lav-soft text-lav-deep">{job.employment_type.replace(/_/g, " ").toLowerCase()}</li>
            )}
            {job.source && <li className="chip bg-sky-soft text-sky-deep">Found on {job.source}</li>}
          </ul>

          <div className="flex flex-wrap gap-2">
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                View posting
                <ExternalLink size={16} />
              </a>
            ) : (
              <span className="btn btn-quiet cursor-not-allowed opacity-60">No link available</span>
            )}
            {job.google_link && job.google_link !== link && (
              <a href={job.google_link} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                Open on Google Jobs
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Status</p>
            <div role="group" aria-label="Listing status" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={job.status === s}
                  onClick={() => job.status !== s && onStatus(job, s)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
                    job.status === s ? `${STATUS_ACTIVE[s]} border-transparent` : "border-line bg-white text-ink-soft hover:bg-lav-soft"
                  )}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-semibold">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== (job.notes ?? "") && onNotes(job, notes)}
              placeholder="Recruiter replied, questions to ask, stack details"
              className="field resize-y"
            />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Description</h3>
            {job.description ? (
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
                <Highlight text={job.description.slice(0, 12000)} terms={terms} />
              </p>
            ) : (
              <p className="text-sm text-ink-soft">This listing came without a description. Open the posting to read it.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
