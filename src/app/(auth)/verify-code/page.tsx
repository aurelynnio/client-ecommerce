import VerifyCodeClient from './VerifyCodeClient';

type VerifyCodePageProps = {
  searchParams: Promise<{
    email?: string;
    code?: string;
  }>;
};

export default async function VerifyCodePage({ searchParams }: VerifyCodePageProps) {
  const params = await searchParams;
  return (
    <VerifyCodeClient initialEmail={params?.email ?? null} initialCode={params?.code ?? null} />
  );
}
