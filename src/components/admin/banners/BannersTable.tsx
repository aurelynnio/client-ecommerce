import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Filter,
  Download,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { BannerItem } from '@/types/banner';
import { Badge } from '@/components/ui/badge';
import SpinnerLoading from '@/components/common/SpinnerLoading';
import Image from 'next/image';
import {
  adminFilterBarClass,
  adminMediaPlaceholderClass,
  adminMenuContentClass,
  adminMenuSeparatorClass,
  adminNativeSelectClass,
  adminRowHoverClass,
  adminSearchInputClass,
  adminSmallIconButtonClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from '@/components/admin/shared/AdminPrimitives';

interface BannersTableProps {
  banners: BannerItem[];
  searchTerm: string;
  pageSize: number;
  isLoading?: boolean;
  onSearch: (value: string) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (banner: BannerItem) => void;
  onDelete: (banner: BannerItem) => void;
}

export const getStatusBadge = (status: boolean) => {
  return status ? (
    <Badge variant="success" className="border-0 rounded-lg px-2.5 py-0.5 shadow-none">
      <CheckCircle className="h-3 w-3 mr-1" />
      Đang hoạt động
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="border-0 rounded-lg bg-muted text-muted-foreground px-2.5 py-0.5 shadow-none"
    >
      <XCircle className="h-3 w-3 mr-1" />
      Ngừng hoạt động
    </Badge>
  );
};

export function BannersTable({
  banners,
  searchTerm,
  pageSize,
  onSearch,
  onPageSizeChange,
  onEdit,
  onDelete,
  isLoading = false,
}: BannersTableProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearchRef.current(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className={adminFilterBarClass}>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm banner..."
              value={localSearch}
              onChange={handleSearch}
              className={`pl-9 transition-[border-color,background-color,box-shadow] ${adminSearchInputClass}`}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className={adminSmallIconButtonClass}
            disabled
            title="Bộ lọc nâng cao chưa được hỗ trợ"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={adminSmallIconButtonClass}
            disabled
            title="Chưa hỗ trợ xuất dữ liệu"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Label htmlFor="pageSize" className="text-sm font-medium text-muted-foreground">
            Hiển thị:
          </Label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={adminNativeSelectClass}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={adminTableShellClass}>
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className={adminTableHeaderClass}>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="w-[350px] uppercase text-xs font-bold tracking-wider text-muted-foreground pl-6">
                  Nội dung Banner
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Chủ đề
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Trạng thái
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground text-right pr-6">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex justify-center items-center">
                      <SpinnerLoading />
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                      <div className="text-muted-foreground">Không tìm thấy banner</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                banners.map((banner) => (
                  <TableRow key={banner._id} className={`${adminRowHoverClass} border-0`}>
                    <TableCell className="font-medium p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`relative h-16 w-28 overflow-hidden rounded-lg flex-shrink-0 ${adminMediaPlaceholderClass}`}
                        >
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground line-clamp-1">
                            {banner.title}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {banner.subtitle}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-lg border-0 bg-muted font-medium capitalize"
                      >
                        {banner.theme || 'light'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(banner.isActive)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className={`p-0 ${adminSmallIconButtonClass}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={adminMenuContentClass}>
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onEdit(banner)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className={adminMenuSeparatorClass} />
                          <DropdownMenuItem
                            onClick={() => onDelete(banner)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa banner
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
