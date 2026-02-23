import { redirect } from "next/navigation";

interface PageProps {
  searchParams?: {
    status?: string;
  };
}

export default function ProfileOrdersRedirectPage({ searchParams }: PageProps) {
  const params = new URLSearchParams({ tab: "orders" });

  if (searchParams?.status) {
    params.set("status", searchParams.status);
  }

  redirect(`/profile?${params.toString()}`);
}
