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
import { Address } from "@/types/address";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Shield,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import Image from "next/image";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { formatDate as formatDateValue } from "@/utils/format";
import {
  adminFilterBarClass,
  adminMediaPlaceholderClass,
  adminMenuContentClass,
  adminMenuLabelClass,
  adminMenuSeparatorClass,
  adminNativeSelectClass,
  adminRowHoverClass,
  adminSearchInputClass,
  adminSmallIconButtonClass,
  adminTableHeaderClass,
  adminTableShellClass,
} from "@/components/admin/shared/AdminPrimitives";

interface UsersTableProps {
  users: User[];
  searchTerm: string;
  pageSize: number;
  isLoading?: boolean;
  onSearch: (value: string) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  onRoleFilterChange?: (role: string) => void;
  onVerifiedFilterChange?: (isVerified: boolean | null) => void;
  selectedRole?: string;
  selectedVerified?: boolean | null;
}

export const getVerifiedBadge = (isVerified: boolean) => {
  return isVerified ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-lg px-2.5 py-0.5 shadow-none">
      <CheckCircle className="h-3 w-3 mr-1" />
      Đã xác minh
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-gray-100 text-gray-600 border-0 rounded-lg px-2.5 py-0.5 shadow-none"
    >
      <XCircle className="h-3 w-3 mr-1" />
      Chưa xác minh
    </Badge>
  );
};

export const getRoleBadge = (roles: string) => {
  const colors: { [key: string]: string } = {
    admin: "bg-purple-100 text-purple-700 hover:bg-purple-100 border-0",
    user: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-0",
  };

  const roleNames: { [key: string]: string } = {
    admin: "Quản trị viên",
    user: "Người dùng",
  };

  return (
    <Badge
      variant="secondary"
      className={`rounded-lg px-2.5 py-0.5 shadow-none ${colors[roles] || "bg-gray-100 text-gray-700 border-0"}`}
    >
      {roleNames[roles] || roles}
    </Badge>
  );
};

export function UsersTable({
  users,
  searchTerm,
  pageSize,
  isLoading = false,
  onSearch,
  onPageSizeChange,
  onEdit,
  onDelete,
  onView,
  onRoleFilterChange,
  onVerifiedFilterChange,
  selectedRole = "",
  selectedVerified = null,
}: UsersTableProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch);
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

  const handleRoleFilter = (role: string) => {
    onRoleFilterChange?.(role);
  };

  const handleVerifiedFilter = (isVerified: boolean | null) => {
    onVerifiedFilterChange?.(isVerified);
  };

  const getPrimaryAddress = (addresses: Address[]) => {
    if (!addresses || addresses.length === 0) return "Chưa có địa chỉ";
    return addresses[0].address;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className={adminFilterBarClass}>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={localSearch}
              onChange={handleSearch}
              className={`pl-9 transition-all ${adminSearchInputClass}`}
            />
          </div>

          {/* Role Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start rounded-2xl border border-slate-200 bg-white/90 hover:bg-white sm:w-auto sm:justify-center"
              >
                <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                {selectedRole === "admin"
                  ? "Quản trị viên"
                  : selectedRole === "user"
                  ? "Người dùng"
                  : "Tất cả vai trò"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={adminMenuContentClass}>
              <DropdownMenuLabel className={adminMenuLabelClass}>
                Lọc theo vai trò
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={adminMenuSeparatorClass} />
              <DropdownMenuItem
                onClick={() => handleRoleFilter("")}
                 className={`cursor-pointer rounded-lg ${!selectedRole ? "bg-[#f7f7f7] font-medium" : ""}`}
              >
                Tất cả vai trò
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleFilter("admin")}
                className={`cursor-pointer rounded-lg ${selectedRole === "admin" ? "bg-[#f7f7f7] font-medium" : ""}`}
              >
                Quản trị viên
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleFilter("user")}
                 className={`cursor-pointer rounded-lg ${selectedRole === "user" ? "bg-[#f7f7f7] font-medium" : ""}`}
              >
                Người dùng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Verified Email Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start rounded-2xl border border-slate-200 bg-white/90 hover:bg-white sm:w-auto sm:justify-center"
              >
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                {selectedVerified === true
                  ? "Đã xác minh"
                  : selectedVerified === false
                  ? "Chưa xác minh"
                  : "Trạng thái"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={adminMenuContentClass}>
              <DropdownMenuLabel className={adminMenuLabelClass}>
                Lọc theo xác minh
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={adminMenuSeparatorClass} />
              <DropdownMenuItem
                onClick={() => handleVerifiedFilter(null)}
                className={`cursor-pointer rounded-lg ${selectedVerified === null ? "bg-[#f7f7f7] font-medium" : ""}`}
              >
                Tất cả trạng thái
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleVerifiedFilter(true)}
                 className={`cursor-pointer rounded-lg ${selectedVerified === true ? "bg-[#f7f7f7] font-medium" : ""}`}
              >
                Đã xác minh
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleVerifiedFilter(false)}
                 className={`cursor-pointer rounded-lg ${selectedVerified === false ? "bg-[#f7f7f7] font-medium" : ""}`}
              >
                Chưa xác minh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
          <span className="text-sm font-medium text-muted-foreground">
            Hiển thị:
          </span>
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
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground pl-6">
                    Người dùng
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                    Vai trò
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                    Địa chỉ
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                    Xác minh Email
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground">
                    Ngày tạo
                </TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-wider text-muted-foreground text-right pr-6">
                    Thao tác
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading && (
                <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex justify-center items-center">
                        <SpinnerLoading />
                    </div>
                    </TableCell>
                </TableRow>
                )}
                {!isLoading && users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <UserIcon className="h-12 w-12 mb-3 opacity-20" />
                        <div className="text-muted-foreground">
                        Không tìm thấy người dùng
                        </div>
                    </div>
                    </TableCell>
                </TableRow>
                ) : (
                users.map((user) => (
                    <TableRow
                    key={user._id}
                     className={`${adminRowHoverClass} border-0`}
                    >
                    <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-3">
                            <div className={`relative w-10 h-10 rounded-full overflow-hidden ${adminMediaPlaceholderClass}`}>
                                {user.avatar ? (
                                <Image
                                    alt={user?.username as string}
                                    src={user?.avatar as string}
                                    fill
                                    className="object-cover"
                                />
                                ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                                )}
                            </div>
                            <div>
                            <p className="font-semibold text-foreground text-sm">
                                {user.username}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                            </div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.roles || "user")}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1 max-w-[200px]">
                            {getPrimaryAddress(user.addresses)}
                        </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        {getVerifiedBadge(user.isVerifiedEmail)}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateValue(user.createdAt)}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" className={`p-0 ${adminSmallIconButtonClass}`}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className={adminMenuContentClass}
                        >
                            <DropdownMenuLabel className={adminMenuLabelClass}>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem
                            onClick={() => onView(user)}
                             className="cursor-pointer rounded-lg gap-2"
                            >
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                            onClick={() => onEdit(user)}
                             className="cursor-pointer rounded-lg gap-2"
                            >
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className={adminMenuSeparatorClass} />
                            <DropdownMenuItem
                             className="cursor-pointer rounded-lg gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => onDelete(user)}
                            >
                            <Trash2 className="h-4 w-4" />
                            Xóa người dùng
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))
                )}
            </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
