import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StarRating } from '@/components/common/StarRating';

export default function ReviewItem({
  initial,
  name,
  rating,
  date,
  verified,
  comment,
}: {
  initial: string;
  name: string;
  rating: number;
  date: string;
  verified?: boolean;
  comment: string;
}) {
  return (
    <div className="py-6 border-b border-border/50 last:border-0 last:pb-0">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 border">
          <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{name}</h4>
                {verified && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] bg-success/15 text-success hover:bg-success/15 gap-1 rounded-sm font-normal"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Đã xác minh
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StarRating value={rating} size="sm" readOnly />
                <span className="text-xs text-muted-foreground">• {date}</span>
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{comment}</p>
        </div>
      </div>
    </div>
  );
}
