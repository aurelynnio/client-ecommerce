'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { ChatAttachment } from '@/types/chat';
import { cn } from '@/utils/cn';

interface ChatAttachmentsProps {
  attachments?: ChatAttachment[];
  isOwnMessage?: boolean;
}

const formatFileSize = (size?: number) => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ChatAttachments({
  attachments = [],
  isOwnMessage = false,
}: ChatAttachmentsProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType?.startsWith('image/');

        if (isImage) {
          return (
            <Link
              key={`${attachment.url}-${attachment.fileName}`}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg"
            >
              <div className="relative h-48 w-full overflow-hidden rounded-lg bg-black/5">
                <Image
                  src={attachment.url}
                  alt={attachment.fileName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={`${attachment.url}-${attachment.fileName}`}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
              isOwnMessage
                ? 'border-white/20 bg-white/10 hover:bg-white/15'
                : 'border-black/10 bg-black/5 hover:bg-black/8',
            )}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{attachment.fileName}</p>
              <p className="text-[10px] opacity-80">
                {[attachment.mimeType, formatFileSize(attachment.size)].filter(Boolean).join(' • ')}
              </p>
            </div>
            <Download className="h-4 w-4 shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
