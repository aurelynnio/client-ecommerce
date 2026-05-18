import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Package,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Category } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import Image from "next/image";
import { formatDate } from "@/utils/format";
import {
  adminCodePillClass,
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
} from "@/components/admin/shared/AdminPrimitives";

interface CategoriesTableProps {
  categories: Category[];
  searchTerm: string;
  pageSize: number;
  isLoading?: boolean;
  onSearch: (value: string) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onView: (category: Category) => void;
  getParentName: (category: Category) => string;
  getProductCount: (category: Category) => number;
}

export const getStatusBadge = (status: boolean) => {
  return status ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 border-0 rounded-lg px-2.5 py-0.5 shadow-none">
      <CheckCircle className="h-3 w-3 mr-1" />
      Đang hoạt động
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-gray-100 text-gray-600 border-0 rounded-lg px-2.5 py-0.5 shadow-none"
    >
      <XCircle className="h-3 w-3 mr-1" />
      Ngừng hoạt động
    </Badge>
  );
};

const CategoryRow = ({
  category,
  level = 0,
  onEdit,
  onDelete,
  onView,
  getParentName,
  getProductCount,
  isLoading = false,
}: {
  category: Category;
  level?: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onView: (c: Category) => void;
  getParentName: (c: Category) => string;
  getProductCount: (c: Category) => number;
  isLoading?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren =
    category.subcategories && category.subcategories.length > 0;

  return (
    <>
      <TableRow
        className={`${adminRowHoverClass} border-0 ${
          isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <TableCell className="font-medium p-4">
          <div
            className="flex items-center"
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 h-6 w-6 rounded-lg p-0 hover:bg-white"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            ) : (
              <div className="w-8" />
            )}
            {category.images && category.images.length > 0 ? (
              <div className={`relative h-10 w-10 mr-3 rounded-lg overflow-hidden ${adminMediaPlaceholderClass}`}>
                <Image
                  src={category.images[0]}
                  alt={category.name as string}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className={`w-10 h-10 mr-3 rounded-lg flex items-center justify-center ${adminMediaPlaceholderClass}`}>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <span
              className={`text-sm ${level > 0 ? "text-muted-foreground" : "font-medium text-foreground"}`}
            >
              {category.name}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <code className={adminCodePillClass}>
            {category.slug}
          </code>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {getParentName(category)}
        </TableCell>
        <TableCell className="text-center font-medium text-sm">
          {getProductCount(category)}
        </TableCell>
        <TableCell>{getStatusBadge(category.isActive)}</TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {formatDate(category.updatedAt)}
        </TableCell>
        <TableCell className="text-right pr-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`p-0 ${adminSmallIconButtonClass}`}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={adminMenuContentClass}
            >
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onView(category)}
                className="cursor-pointer gap-2"
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(category)}
                className="cursor-pointer gap-2"
              >
                <Edit className="h-4 w-4" />
                Sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator className={adminMenuSeparatorClass} />
              <DropdownMenuItem
                onClick={() => onDelete(category)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Xóa danh mục
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {isExpanded &&
        hasChildren &&
        category.subcategories?.map((sub) => (
          <CategoryRow
            key={sub._id}
            category={sub}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            getParentName={getParentName}
            getProductCount={getProductCount}
          />
        ))}
    </>
  );
};

export function CategoriesTable({
  categories,
  searchTerm,
  pageSize,
  onSearch,
  onPageSizeChange,
  onEdit,
  onDelete,
  onView,
  getParentName,
  getProductCount,
  isLoading = false,
}: CategoriesTableProps) {
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
              placeholder="Tìm kiếm danh mục..."
              value={localSearch}
              onChange={handleSearch}
              className={`pl-9 transition-all ${adminSearchInputClass}`}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className={adminSmallIconButtonClass}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={adminSmallIconButtonClass}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Label
            htmlFor="pageSize"
            className="text-sm font-medium text-muted-foreground"
          >
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
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={adminTableShellClass}>
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className={adminTableHeaderClass}>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="w-[300px] uppercase text-xs font-bold tracking-wider text-muted-foreground pl-6">
                  Tên danh mục
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Slug
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Danh mục cha
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground text-center">
                  Sản phẩm
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Trạng thái
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                  Cập nhật lúc
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground text-right pr-6">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex justify-center items-center">
                      <SpinnerLoading />
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && categories.length === 0 && (
                <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Package className="h-12 w-12 mb-3 opacity-20" />
                  <div className="text-muted-foreground">
                    Không tìm thấy danh mục
                  </div>
                </div>
              </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                categories.map((category) => (
                  <CategoryRow
                    key={category._id}
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    getParentName={getParentName}
                    getProductCount={getProductCount}
                    isLoading={isLoading}
                  />
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
