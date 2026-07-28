'use client';

import { useState, useMemo } from 'react';
import {
  useAdminVouchers,
  useVoucherStatistics,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
} from '@/hooks/queries';
import { VouchersHeader } from '@/components/admin/vouchers/VouchersHeader';
import { VouchersStats } from '@/components/admin/vouchers/VouchersStats';
import { DiscountsTable } from '@/components/admin/vouchers/VouchersTable';
import { CreateModelDiscount } from '@/components/admin/vouchers/CreateVoucherModal';
import { UpdateModelDiscount } from '@/components/admin/vouchers/UpdateVoucherModal';
import { ViewModelDiscount } from '@/components/admin/vouchers/ViewVoucherModal';
import {
  Voucher,
  CreateVoucherData,
  UpdateVoucherData,
  VoucherFilters,
  VoucherScope,
} from '@/types/voucher';
import { toast } from 'sonner';
import { PaginationControls } from '@/components/common/Pagination';
import { getSafeErrorMessage } from '@/api';
import { useAppSelector } from '@/hooks/hooks';

export default function VouchersPage() {
  const { isAuthenticated, data: currentUser } = useAppSelector((state) => state.auth);
  const canFetchAdminData = isAuthenticated && currentUser?.roles === 'admin';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedIsActive, setSelectedIsActive] = useState<boolean | null>(null);
  const [selectedScope, setSelectedScope] = useState('all');

  const queryParams = useMemo((): Partial<VoucherFilters> => {
    const params: Partial<VoucherFilters> = {
      page: currentPage,
      limit: pageSize,
    };
    if (searchTerm) params.search = searchTerm;
    if (selectedType !== 'all')
      params.type = selectedType === 'percent' ? 'percentage' : 'fixed_amount';
    if (selectedIsActive !== null) params.isActive = selectedIsActive;
    if (selectedScope !== 'all') params.scope = selectedScope as VoucherScope;
    return params;
  }, [currentPage, pageSize, searchTerm, selectedType, selectedIsActive, selectedScope]);

  const { data: vouchersData, isLoading } = useAdminVouchers(queryParams, {
    enabled: canFetchAdminData,
  });
  const { data: statistics } = useVoucherStatistics({
    enabled: canFetchAdminData,
  });
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  const vouchers = vouchersData?.vouchers || [];

  // Transform pagination to match PaginationData interface
  const pagination = useMemo(() => {
    const paginationRaw = vouchersData?.pagination;
    if (!paginationRaw) return null;
    return {
      currentPage: paginationRaw.page,
      pageSize: paginationRaw.limit,
      totalPages: paginationRaw.totalPages,
      totalItems: paginationRaw.total,
      hasNextPage: paginationRaw.page < paginationRaw.totalPages,
      hasPrevPage: paginationRaw.page > 1,
      nextPage: paginationRaw.page < paginationRaw.totalPages ? paginationRaw.page + 1 : null,
      prevPage: paginationRaw.page > 1 ? paginationRaw.page - 1 : null,
    };
  }, [vouchersData?.pagination]);

  // Handlers
  const handleCreate = async (data: CreateVoucherData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Voucher created successfully');
      setIsCreateOpen(false);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Failed to create voucher'));
    }
  };

  const handleUpdate = async (data: UpdateVoucherData) => {
    if (!selectedVoucher) return;
    try {
      await updateMutation.mutateAsync({ id: selectedVoucher._id, ...data });
      toast.success('Voucher updated successfully');
      setIsUpdateOpen(false);
      setSelectedVoucher(null);
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Failed to update voucher'));
    }
  };

  const handleDelete = async (voucher: Voucher) => {
    if (!confirm(`Are you sure you want to delete voucher "${voucher.code}"?`)) return;
    try {
      await deleteMutation.mutateAsync(voucher._id);
      toast.success('Voucher deleted successfully');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Failed to delete voucher'));
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsUpdateOpen(true);
  };

  const handleView = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsViewOpen(true);
  };

  // Calculate stats
  const totalVouchers = statistics?.totalVouchers || vouchers.length;
  const activeVouchers = statistics?.activeVouchers || vouchers.filter((v) => v.isActive).length;
  const expiredVouchers =
    statistics?.expiredVouchers || vouchers.filter((v) => new Date(v.endDate) < new Date()).length;
  const highUsageVouchers = vouchers.filter((v) => v.usageCount / v.usageLimit > 0.8).length;

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-8">
      <VouchersHeader onOpenCreate={() => setIsCreateOpen(true)} />

      <VouchersStats
        totalVouchers={totalVouchers}
        activeVouchers={activeVouchers}
        expiredVouchers={expiredVouchers}
        highUsageVouchers={highUsageVouchers}
      />

      <DiscountsTable
        discounts={vouchers}
        searchTerm={searchTerm}
        pageSize={pageSize}
        isLoading={isLoading}
        onSearch={setSearchTerm}
        onPageSizeChange={setPageSize}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onDiscountTypeFilterChange={setSelectedType}
        onActiveFilterChange={setSelectedIsActive}
        onScopeFilterChange={setSelectedScope}
        selectedDiscountType={selectedType}
        selectedIsActive={selectedIsActive}
        selectedScope={selectedScope}
      />

      {pagination && pagination.totalPages > 1 && (
        <PaginationControls pagination={pagination} onPageChange={setCurrentPage} />
      )}

      <CreateModelDiscount
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
        isLoading={isMutating}
      />

      <UpdateModelDiscount
        key={selectedVoucher?._id}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        discount={selectedVoucher}
        onUpdate={handleUpdate}
        isLoading={isMutating}
      />

      <ViewModelDiscount
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        discount={selectedVoucher}
        onEdit={handleEdit}
      />
    </div>
  );
}
