'use client';
import { useMyShop } from '@/hooks/queries/useShop';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { SettingsForm } from './_components/SettingsForm';

export default function SellerSettingsPage() {
  const { data: myShop, isLoading } = useMyShop();

  if (isLoading) return <SpinnerLoading fullPage />;
  if (!myShop) return null;

  return <SettingsForm key={myShop._id} myShop={myShop} />;
}
