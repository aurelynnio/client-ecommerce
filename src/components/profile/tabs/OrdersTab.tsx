"use client";
import { Package, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserOrders, useCancelOrder } from "@/hooks/queries/useOrders";
import { toast } from "sonner";
import { Order } from "@/types/order";
import OrderCard from "../order/OrderCard";
import OrderDialog from "../order/OrderDialog";
import SpinnerLoading from "@/components/common/SpinnerLoading";
import { cn } from "@/utils/cn";
import { getSafeErrorMessage } from "@/api";

type OrderStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export default function OrdersTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useUserOrders({ limit: 50 });
  const cancelOrderMutation = useCancelOrder();

  const userOrders = data?.orders || [];
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("all");

  useEffect(() => {
    const requestedStatus = searchParams.get("status") as OrderStatus | null;
    if (
      requestedStatus &&
      [
        "all",
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ].includes(requestedStatus)
    ) {
      setActiveStatus(requestedStatus);
    }
  }, [searchParams]);

  const handleViewOrder = (orderId: string) => {
    const order = userOrders.find((order) => order._id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      await cancelOrderMutation.mutateAsync(orderId);
      toast.success("Đã hủy đơn hàng thành công");
    } catch (error: unknown) {
      console.error("Error cancelling order:", error);
      toast.error(getSafeErrorMessage(error, "Không thể hủy đơn hàng"));
    } finally {
      setCancellingOrder(null);
    }
  };

  // Filter orders by status
  const filteredOrders = userOrders.filter((order) => {
    if (activeStatus === "all") return true;
    return order.status?.toLowerCase() === activeStatus.toLowerCase();
  });

  const getOrderCount = (status: OrderStatus) => {
    if (status === "all") return userOrders.length;
    return userOrders.filter(
      (order) => order.status?.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const statusTabs: { value: OrderStatus; label: string; count: number }[] = [
    { value: "all", label: "Tất cả", count: getOrderCount("all") },
    { value: "pending", label: "Chờ xử lý", count: getOrderCount("pending") },
    {
      value: "confirmed",
      label: "Đã xác nhận",
      count: getOrderCount("confirmed"),
    },
    {
      value: "processing",
      label: "Đang xử lý",
      count: getOrderCount("processing"),
    },
    { value: "shipped", label: "Đang giao", count: getOrderCount("shipped") },
    {
      value: "delivered",
      label: "Đã giao",
      count: getOrderCount("delivered"),
    },
    {
      value: "cancelled",
      label: "Đã hủy",
      count: getOrderCount("cancelled"),
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <Package className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-2">
          Đã xảy ra lỗi
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm text-sm">
          Chúng tôi không thể tải đơn hàng của bạn. Đây có thể là sự cố tạm thời.
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-sm bg-[#E53935] text-white px-6 py-2 hover:bg-[#D32F2F] transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative min-h-[400px]">
      {isLoading && <SpinnerLoading className="absolute inset-0 m-auto" />}
      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        {!userOrders || userOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm text-sm">
              Có vẻ như bạn chưa đặt đơn hàng nào. Hãy bắt đầu mua sắm để lấp đầy trang này!
            </p>
            <Button
              onClick={() => router.push("/products")}
              size="lg"
              className="rounded-sm px-8"
            >
              Bắt đầu mua sắm
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Lịch sử đơn hàng
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/products")}
                className="rounded-sm"
              >
                Tiếp tục mua sắm
              </Button>
            </div>

            <Tabs
              value={activeStatus}
              onValueChange={(value) => setActiveStatus(value as OrderStatus)}
              className="w-full"
            >
              <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <TabsList className="h-auto p-1 bg-muted/30 rounded-md inline-flex w-auto min-w-full sm:min-w-0">
                  {statusTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        "rounded-sm px-4 py-2 text-xs font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                        tab.count === 0 && "text-muted-foreground/60"
                      )}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="ml-1.5 opacity-70">({tab.count})</span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeStatus} className="mt-6 space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-md bg-muted/20">
                    <Filter className="h-10 w-10 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium mb-1">
                      Không có đơn hàng {activeStatus === "all" ? "" : statusTabs.find(t => t.value === activeStatus)?.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Chúng tôi không tìm thấy đơn hàng nào với trạng thái này.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredOrders.map((order: Order, index: number) => (
                      <OrderCard
                        key={order._id || `order-${index}`}
                        order={order}
                        onViewOrder={handleViewOrder}
                        onCancelOrder={handleCancelOrder}
                        isCancelling={cancellingOrder === order._id}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <OrderDialog
              order={selectedOrder}
              open={isDialogOpen}
              onClose={handleCloseDialog}
            />
          </>
        )}
      </div>
    </div>
  );
}
