import React from 'react';

export default function LayoutCategories({ children }: { children: React.ReactNode }) {
  return <main className="w-full min-h-screen bg-background">{children}</main>;
}
