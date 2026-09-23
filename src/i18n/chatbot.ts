// Lightweight i18n dictionary for chatbot widget.

import { useMemo } from 'react';

export const DICTIONARIES = {
  vi: {
    ready: 'Mia sẵn sàng hỗ trợ',
    close: 'Đóng',
    assistant: 'Mia - Trợ lý Mua Sắm',
    subtitle: 'Hỗ trợ mua sắm thông minh',
    welcome: 'Em là trợ lý mua sắm Nantian, có thể giúp bạn tìm kiếm sản phẩm, tư vấn chọn size, săn mã giảm giá hoặc kiểm tra thông tin đơn hàng.',
    placeholder: 'Nhập câu hỏi hoặc yêu cầu tìm đồ...',
    quickFind: 'Tìm sản phẩm',
    quickSale: 'Khuyến mãi hot',
    quickBest: 'Bán chạy nhất',
    quickFashion: 'Xu hướng mới',
    queryFind: 'Tìm các mẫu áo thun thời trang',
    querySale: 'Có những sản phẩm nào đang giảm giá sâu?',
    queryBest: 'Gợi ý cho tôi các sản phẩm bán chạy nhất',
    queryFashion: 'Tư vấn phối đồ thời trang xu hướng mới',
    timeout: '⚠️ Phản hồi quá lâu, vui lòng thử lại.',
    networkError: 'Xin lỗi, không thể kết nối. Vui lòng thử lại!',
    stop: 'Dừng phản hồi',
    regenerate: 'Tạo lại câu trả lời',
    copy: 'Sao chép',
    copied: 'Đã sao chép',
    feedbackThanks: 'Cảm ơn phản hồi của anh/chị!',
    feedbackFail: 'Không thể gửi phản hồi',
    retry: 'Thử lại',
    clearChat: 'Làm mới hội thoại',
    dialogLabel: 'Mia - Trợ lý Mua Sắm Nantian',
    closeDialogLabel: 'Đóng Trợ lý Mua Sắm',
    cskhSupport: 'Gặp tư vấn viên',
    scrollToBottom: 'Xuống tin nhắn mới',
  },
  en: {
    ready: 'Mia is ready to help',
    close: 'Close',
    assistant: 'Mia - Shopping Concierge',
    subtitle: 'Smart shopping assistant',
    welcome: 'I am your personal shopping concierge. I can help you find products, advise on sizes, track deals, or answer order inquiries.',
    placeholder: 'Type a message or request...',
    quickFind: 'Find products',
    quickSale: 'Hot deals',
    quickBest: 'Bestsellers',
    quickFashion: 'Trending',
    queryFind: 'Find stylish t-shirts',
    querySale: 'What items are on high discount?',
    queryBest: 'Show me top bestselling products',
    queryFashion: 'Give me trending fashion outfit advice',
    timeout: '⚠️ Response took too long, please try again.',
    networkError: 'Sorry, cannot connect. Please try again!',
    stop: 'Stop generating',
    regenerate: 'Regenerate answer',
    copy: 'Copy',
    copied: 'Copied',
    feedbackThanks: 'Thanks for your feedback!',
    feedbackFail: 'Could not send feedback',
    retry: 'Retry',
    clearChat: 'Refresh chat',
    dialogLabel: 'Mia - Shopping Concierge',
    closeDialogLabel: 'Close Shopping Concierge',
    cskhSupport: 'Human support',
    scrollToBottom: 'Scroll to bottom',
  },
};

export const SUPPORTED_LANGUAGES = ['vi', 'en'];

const detectLanguage = () => {
  if (typeof navigator === 'undefined') return 'vi';
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : 'vi';
};

export const useT = (lang: string = detectLanguage()) =>
  useMemo(() => {
    if (lang in DICTIONARIES) {
      return DICTIONARIES[lang as keyof typeof DICTIONARIES];
    }
    return DICTIONARIES.vi;
  }, [lang]);
