'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Store, MapPin, Settings, Package, BarChart3 } from 'lucide-react';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { Button } from '@/components/ui/button';
import { useMyShop } from '@/hooks/queries/useShop';

export default function ShopTab() {
  const router = useRouter();
  const { data: myShop, isLoading } = useMyShop();

  // canHaveShop check removed as it was unused and logic is handled by backend/middleware

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <SpinnerLoading size={32} />
      </div>
    );
  }

  // User doesn't have a shop yet
  if (!myShop) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Store className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Bạn chưa có shop</h3>
          <p className="text-muted-foreground text-sm">
            Đăng ký bán hàng để bắt đầu kinh doanh trên nền tảng
          </p>
        </div>
        <Button
          onClick={() => router.push('/seller/register')}
          className="bg-primary hover:bg-primary/90"
        >
          <Store className="h-4 w-4 mr-2" />
          Đăng ký bán hàng
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Shop Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-32 rounded-xl overflow-hidden bg-primary-light">
          {myShop.banner && (
            <Image src={myShop.banner} alt="Shop Banner" fill className="object-cover" />
          )}
        </div>

        {/* Logo & Info */}
        <div className="flex items-end gap-4 -mt-10 px-4">
          <div className="relative w-20 h-20 rounded-full border-4 border-white bg-card shadow-lg overflow-hidden">
            {myShop.logo ? (
              <Image src={myShop.logo} alt={myShop.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Store className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{myShop.name}</h2>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  myShop.status === 'active'
                    ? 'bg-success/15 text-success'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {myShop.status === 'active' ? 'Đang hoạt động' : myShop.status}
              </span>
            </div>
            {myShop.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {myShop.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Shop Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Store} label="Người theo dõi" value={myShop.followerCount || 0} />
        <StatCard icon={BarChart3} label="Đánh giá" value={myShop.rating?.toFixed(1) || '0.0'} />
        <StatCard icon={Package} label="Phản hồi" value={`${myShop.metrics?.responseRate || 0}%`} />
      </div>

      {/* Pickup Address */}
      {myShop.pickupAddress && (
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Địa chỉ lấy hàng</p>
              <p className="font-semibold">
                {myShop.pickupAddress.fullName} - {myShop.pickupAddress.phone}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground pl-[52px]">
            {myShop.pickupAddress.address}, {myShop.pickupAddress.ward},{' '}
            {myShop.pickupAddress.district}, {myShop.pickupAddress.city}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button onClick={() => router.push('/seller')} variant="outline" className="flex-1">
          <Settings className="h-4 w-4 mr-2" />
          Kênh người bán
        </Button>
        <Button
          onClick={() => router.push('/seller/products')}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Package className="h-4 w-4 mr-2" />
          Quản lý sản phẩm
        </Button>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => (
  <div className="rounded-lg bg-muted p-4 text-center">
    <Icon className="h-5 w-5 mx-auto text-primary mb-2" />
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);
