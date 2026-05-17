"use client";
import { MapPin, Plus, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddressDialog from "../address/AddressDialog";
import { useState } from "react";
import { useDeleteAddress, useProfile } from "@/hooks/queries/useProfile";
import { toast } from "sonner";
import { Address, AddressTabProps } from "@/types/address";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { cn } from "@/utils/cn";
import { getSafeErrorMessage } from "@/api";

export default function AddressTab({ user }: AddressTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const deleteAddressMutation = useDeleteAddress();
  const { isLoading, refetch } = useProfile();

  const addresses = user?.addresses || [];

  const openAddDialog = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
  };

  const handleSuccess = async () => {
    try {
      await refetch();
    } catch (error: unknown) {
      console.error("Error refreshing profile:", error);
      toast.error(getSafeErrorMessage(error, "Không thể cập nhật dữ liệu"));
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
      return;
    }

    setIsDeleting(addressId);

    try {
      await deleteAddressMutation.mutateAsync(addressId);
      toast.success("Đã xóa địa chỉ thành công");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error(
        getSafeErrorMessage(error, "Không thể xóa địa chỉ. Vui lòng thử lại."),
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-md bg-muted/20">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <MapPin className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-medium mb-2">Không tìm thấy địa chỉ</h3>
      <p className="text-muted-foreground mb-6 max-w-xs text-sm">
        Thêm địa chỉ giao hàng để đảm bảo thanh toán nhanh hơn.
      </p>
      <Button onClick={openAddDialog} className="rounded-sm px-6">
        <Plus className="h-4 w-4 mr-2" />
        Thêm địa chỉ mới
      </Button>
    </div>
  );

  const renderAddressCard = (address: Address) => (
    <div
      key={address._id}
      className={cn(
        "group relative flex flex-col md:flex-row justify-between p-5 rounded-md border transition-all duration-200",
        address.isDefault
          ? "border-primary/30 bg-primary/5"
          : "border-border/50 bg-muted/30 hover:bg-muted/50"
      )}
    >
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-base tracking-tight">
            {address.fullName}
          </h4>
          {address.isDefault && (
            <Badge className="rounded-sm bg-primary/10 text-primary text-xs px-2 py-0.5 border-0">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Mặc định
            </Badge>
          )}
        </div>

        <div className="space-y-1 text-sm text-muted-foreground leading-relaxed">
          <p className="text-foreground/80 font-medium">{address.phone}</p>
          <p>{address.address}</p>
          <p>
            {address.district}, {address.city}
          </p>
        </div>
      </div>

      <div className="mt-4 md:mt-0 md:ml-6 flex items-start gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEditDialog(address)}
          className="rounded-sm h-8 px-3 text-xs md:opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Sửa
        </Button>

        {!address.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteAddress(address._id)}
            disabled={isDeleting === address._id || isLoading}
            className="rounded-sm h-8 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {isDeleting === address._id ? (
              <span className="animate-pulse">Đang xóa...</span>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Xóa
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative min-h-[200px]">
      {isLoading && <SpinnerLoading className="absolute inset-0 m-auto" />}
      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Sổ địa chỉ
            </h2>
            <p className="text-muted-foreground text-sm">
              Quản lý các địa điểm nhận hàng của bạn
            </p>
          </div>
          {addresses.length > 0 && (
            <Button onClick={openAddDialog} className="rounded-sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm địa chỉ
            </Button>
          )}
        </div>

        {addresses.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid gap-4 mt-6">
            {addresses.map(renderAddressCard)}
          </div>
        )}

        <AddressDialog
          open={isDialogOpen}
          onClose={closeDialog}
          editingAddress={editingAddress}
          onSuccess={handleSuccess}
          user={user}
        />
      </div>
    </div>
  );
}

// End of file
