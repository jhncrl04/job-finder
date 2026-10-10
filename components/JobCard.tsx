"use client";

import { Bookmark, Check, Clock, ExternalLink, MapPin, RotateCcw, X } from "lucide-react";
import Highlight from "@/components/Highlight";
import { cn, timeAgo, toneFor } from "@/lib/utils";
import type { Job, Status } from "@/lib/types";

interface Action {
  label: string;
  to: Status;
  icon: React.ReactNode;
}

// Quick actions shown on the card, depending on where the job currently is.
function actionsFor(status: Status): Action[] {
  switch (status) {
    case "new":
      return [
        { label: "Save", to: "saved", icon: <Bookmark size={18} /> },
        { label: "Dismiss", to: "dismissed", icon: <X size={18} /> },
      ];
    case "saved":
      return [
        { label: "Mark as applied", to: "applied", icon: <Check size={18} /> },
        { label: "Dismiss", to: "dismissed", icon: <X size={18} /> },
      ];
    case "applied":
      return [{ label: "Move back to saved", to: "saved", icon: <RotateCcw size={18} /> }];
    default:
      return [{ label: "Restore to new", to: "new", icon: <RotateCcw size={18} /> }];
  }
}

interface Props {
  job: Job;
  terms: string[];
  onOpen: (job: Job) => void;
  onStatus: (job: Job, next: Status) => void;
}

export default function JobCard({ job, terms, onOpen, onStatus }: Props) {
  const link = job.apply_link ?? job.google_link;
  const initial = (job.company || job.title).trim().charAt(0).toUpperCase() || "?";

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start gap-3.5">
        <div
          aria-hidden="true"
          className={cn("grid size-12 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold", toneFor(job.company || job.title))}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <button type="button" onClick={() => onOpen(job)} className="text-left hover:underline">
            <h3 className="font-display text-[1.05rem] font-semibold leading-snug">
              <Highlight text={job.title} terms={terms} />
            </h3>
          </button>
          <p className="mt-0.5 truncate text-sm text-ink-soft">{job.company || "Company not listed"}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-ink-soft">
        {job.location && (
          <p className="flex items-center gap-1.5">
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">{job.location}</span>
          </p>
        )}
        <p className="flex items-center gap-1.5">
          <Clock size={15} className="shrink-0" />
          {timeAgo(job.posted_at)}
        </p>
      </div>

      {(job.is_remote || job.salary || job.employment_type || job.source) && (
        <ul className="flex flex-wrap gap-1.5">
          {job.is_remote && <li className="chip bg-mint-soft text-mint-deep">Remote</li>}
          {job.salary && <li className="chip bg-butter-soft text-butter-deep">{job.salary}</li>}
          {job.employment_type && (
            <li className="chip bg-lav-soft text-lav-deep">{job.employment_type.replace(/_/g, " ").toLowerCase()}</li>
          )}
          {job.source && <li className="chip bg-sky-soft text-sky-deep">{job.source}</li>}
        </ul>
      )}

      <div className="mt-auto flex items-center gap-2 pt-1">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-primary flex-1">
            View posting
            <ExternalLink size={16} />
          </a>
        ) : (
          <span className="btn btn-quiet flex-1 cursor-not-allowed opacity-60">No link available</span>
        )}
        {actionsFor(job.status).map((a) => (
          <button
            key={a.to}
            type="button"
            title={a.label}
            aria-label={a.label}
            onClick={() => onStatus(job, a.to)}
            className="icon-btn"
          >
            {a.icon}
          </button>
        ))}
      </div>
    </article>
  );
}
