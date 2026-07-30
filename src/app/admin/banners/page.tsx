'use client';
import { useState } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/hooks/queries';
import { Filters } from '@/hooks/useUrlFilters';
import { BannerItem, CreateBannerPayload, UpdateBannerPayload } from '@/types/banner';
import { BannersHeader } from '@/components/admin/banners/BannersHeader';
import { BannersStats } from '@/components/admin/banners/BannersStats';
import { BannersTable } from '@/components/admin/banners/BannersTable';
import { CreateBannerModal } from '@/components/admin/banners/CreateBannerModal';
import { EditBannerModal } from '@/components/admin/banners/EditBannerModal';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/api';

interface BannerFilters extends Filters {
  page: number;
  limit: number;
  search: string;
}

export default function BannersAdminPage() {
  const { filters, updateFilter, updateFilters } = useUrlFilters<BannerFilters>({
    defaultFilters: {
      page: 1,
      limit: 10,
      search: '',
    },
    basePath: '/admin/banners',
  });

  const {
    data: bannersData,
    isLoading,
    error,
  } = useBanners({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
  });
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const banners = bannersData?.data || [];

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);

  const handleCreateBanner = async (data: CreateBannerPayload) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Banner created successfully');
      setCreateModalOpen(false);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Failed to create banner'));
    }
  };

  const handleUpdateBanner = async (id: string, data: UpdateBannerPayload) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      toast.success('Banner updated successfully');
      setEditModalOpen(false);
      setSelectedBanner(null);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Failed to update banner'));
    }
  };

  const handleDeleteBanner = async (banner: BannerItem) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteMutation.mutateAsync(banner._id);
        toast.success('Banner deleted successfully');
      } catch (error: unknown) {
        toast.error(getSafeErrorMessage(error, 'Failed to delete banner'));
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">
          Error: {getSafeErrorMessage(error, 'Failed to load banners')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <BannersHeader onAddBanner={() => setCreateModalOpen(true)} />

      <BannersStats
        totalBanners={banners.length}
        activeBanners={banners.filter((b) => b.isActive).length}
      />

      <BannersTable
        banners={banners}
        searchTerm={filters.search}
        pageSize={filters.limit}
        isLoading={isLoading}
        onSearch={(val) => updateFilter('search', val)}
        onPageSizeChange={(val) => updateFilters({ limit: val, page: 1 })}
        onEdit={(banner) => {
          setSelectedBanner(banner);
          setEditModalOpen(true);
        }}
        onDelete={handleDeleteBanner}
      />

      <CreateBannerModal
        key={createModalOpen ? 'create-banner-open' : 'create-banner-closed'}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateBanner}
        isLoading={createMutation.isPending}
      />
      <EditBannerModal
        key={selectedBanner ? `edit-banner-${selectedBanner._id}` : 'edit-banner-closed'}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBanner(null);
        }}
        onUpdate={handleUpdateBanner}
        banner={selectedBanner}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
