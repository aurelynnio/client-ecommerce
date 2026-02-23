import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Mua hàng",
    items: [
      "Tìm sản phẩm bằng thanh tìm kiếm hoặc danh mục",
      "Thêm vào giỏ và xác nhận thông tin giao hàng",
      "Áp dụng voucher trước khi thanh toán",
    ],
  },
  {
    title: "Sau khi đặt hàng",
    items: [
      "Theo dõi tại Hồ sơ > Đơn hàng",
      "Liên hệ shop qua tin nhắn nếu cần",
      "Yêu cầu hỗ trợ nếu đơn có sự cố",
    ],
  },
];

export default function HelpPage() {
  return (
    <InfoPage
      title="Trợ giúp"
      description="Hướng dẫn nhanh các thao tác thường dùng khi mua sắm trên hệ thống."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
