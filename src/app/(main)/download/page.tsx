import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Nền tảng hỗ trợ",
    items: [
      "iOS (App Store)",
      "Android (Google Play)",
      "Đồng bộ dữ liệu tài khoản với phiên bản web",
    ],
  },
  {
    title: "Lợi ích khi dùng app",
    items: [
      "Theo dõi trạng thái đơn hàng theo thời gian thực",
      "Nhận thông báo flash sale và voucher sớm",
      "Quản lý địa chỉ, thanh toán và lịch sử đơn hàng nhanh hơn",
    ],
  },
];

export default function DownloadPage() {
  return (
    <InfoPage
      title="Tải ứng dụng"
      description="Tải ứng dụng để mua sắm nhanh hơn, nhận thông báo đơn hàng thời gian thực và quản lý tài khoản thuận tiện trên điện thoại."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
