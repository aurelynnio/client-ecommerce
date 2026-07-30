'use client';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useAdminReviews, useDeleteAdminReview } from '@/hooks/queries';
import { Star, Search, Trash2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaginationControls } from '@/components/common/Pagination';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { getSafeErrorMessage } from '@/api';
import {
  AdminPageHeader,
  adminFilterBarClass,
  adminRowHoverClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from '@/components/admin/shared/AdminPrimitives';

export default function AdminReviewsPage() {
  const { filters, updateFilter, resetFilters } = useUrlFilters({
    defaultFilters: {
      page: 1,
      limit: 10,
      rating: 'all',
      search: '',
    },
    basePath: '/admin/reviews',
  });

  const queryParams = {
    page: Number(filters.page) || 1,
    limit: Number(filters.limit) || 10,
    rating: filters.rating !== 'all' ? Number(filters.rating) : undefined,
    search: filters.search ? String(filters.search) : undefined,
  };

  const { data, isLoading } = useAdminReviews(queryParams);

  const deleteMutation = useDeleteAdminReview();

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa đánh giá thành công');
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, 'Không thể xóa đánh giá'));
    }
  };

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 p-1">
      <AdminPageHeader
        title="Đánh giá sản phẩm"
        description="Tìm, kiểm tra và xử lý các đánh giá từ khách hàng."
      />

      {/* Filters */}
      <div className={adminFilterBarClass}>
        <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm nội dung đánh giá..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={String(filters.rating)} onValueChange={(val) => updateFilter('rating', val)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Số sao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả sao</SelectItem>
            {[5, 4, 3, 2, 1].map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} sao
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
          Reset
        </Button>
      </div>

      {/* Table */}
      <div className={adminTableShellClass}>
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <SpinnerLoading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm text-left">
              <thead className={adminTableHeaderClass}>
                <tr>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Đánh giá</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      Không tìm thấy đánh giá nào
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => {
                    const product = typeof review.product === 'string' ? undefined : review.product;

                    return (
                      <tr key={review._id} className={adminRowHoverClass}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 max-w-[250px]">
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={product?.images?.[0] || '/images/placeholder-product.svg'}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <span className="truncate font-medium">{product?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {review.user?.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {review.user?.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex text-star">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? 'fill-current text-star' : 'text-muted-foreground/30'}`}
                                />
                              ))}
                            </div>
                            <p className="line-clamp-2 italic text-muted-foreground">
                              &quot;{review.comment || 'Không có nội dung'}&quot;
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {product?.slug ? (
                              <Link href={`/products/${product.slug}`} target="_blank">
                                <Button variant="ghost" size="icon" title="Xem sản phẩm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                void handleDelete(review._id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && (
        <div className="flex justify-center mt-6">
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => updateFilter('page', p)}
            itemName="đánh giá"
          />
        </div>
      )}
    </div>
  );
}
