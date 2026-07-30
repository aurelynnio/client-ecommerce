'use client';
import { useState } from 'react';
import { MessageCircle, Reply, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PaginationControls } from '@/components/common/Pagination';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import {
  useMyShopReviews,
  useReplyReview,
  type Review as ShopReview,
} from '@/hooks/queries/useReviews';
import { toast } from 'sonner';
import Image from 'next/image';
import { format } from 'date-fns';

export default function SellerReviewsPage() {
  const { filters, updateFilter, resetFilters } = useUrlFilters({
    defaultFilters: {
      page: 1,
      limit: 10,
      rating: 'all',
    },
    basePath: '/seller/reviews',
  });

  const { data, isLoading } = useMyShopReviews({
    page: Number(filters.page),
    limit: Number(filters.limit),
    rating: filters.rating === 'all' ? undefined : Number(filters.rating),
  });

  const replyMutation = useReplyReview();
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ShopReview | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const reviews = data?.reviews || [];
  const pagination = data?.pagination;

  const handleOpenReply = (review: ShopReview) => {
    setSelectedReview(review);
    setReplyContent(review.reply || '');
    setReplyModalOpen(true);
  };

  const handleReplySubmit = () => {
    if (!selectedReview || !replyContent.trim()) return;

    replyMutation.mutate(
      { reviewId: selectedReview._id, content: replyContent },
      {
        onSuccess: () => {
          toast.success('Đã gửi phản hồi thành công');
          setReplyModalOpen(false);
          setSelectedReview(null);
          setReplyContent('');
        },
        onError: () => toast.error('Không thể gửi phản hồi'),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Đánh giá từ khách hàng
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <Select value={String(filters.rating)} onValueChange={(val) => updateFilter('rating', val)}>
          <SelectTrigger className="w-[150px]">
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

        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <SpinnerLoading />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card py-20 text-center">
            <MessageCircle className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có đánh giá nào</p>
          </div>
        ) : (
          reviews.map((review) => {
            const product = typeof review.product === 'string' ? undefined : review.product;

            return (
              <div key={review._id} className="rounded-lg border border-border bg-card p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={product?.images?.[0] || '/images/placeholder-product.svg'}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">{product?.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-star">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating ? 'fill-current' : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            bởi {review.user?.username} •{' '}
                            {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                      {review.reply ? (
                        <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">
                          Đã phản hồi
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReply(review)}
                          className="gap-2 w-full sm:w-auto"
                        >
                          <Reply className="h-3.5 w-3.5" />
                          Trả lời
                        </Button>
                      )}
                    </div>

                    {/* Review Content */}
                    <p className="mt-3 rounded-lg bg-muted/60 p-3 text-sm text-foreground">
                      {review.comment || 'Không có nội dung'}
                    </p>

                    {/* Shop Reply */}
                    {review.reply && (
                      <div className="mt-3 border-l-2 border-primary pl-4">
                        <p className="mb-1 text-xs font-bold text-primary">
                          Phản hồi của Shop
                          {review.replyAt
                            ? ` • ${format(new Date(review.replyAt), 'dd/MM/yyyy')}`
                            : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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

      {/* Reply Modal */}
      <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trả lời đánh giá</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/60 p-3 text-sm italic text-muted-foreground">
              &quot;{selectedReview?.comment}&quot;
            </div>
            <Textarea
              placeholder="Nhập nội dung phản hồi của bạn..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              disabled={!!selectedReview?.reply}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleReplySubmit}
              disabled={!replyContent.trim() || replyMutation.isPending || !!selectedReview?.reply}
              className=""
            >
              {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
