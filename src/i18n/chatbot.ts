// Lightweight i18n dictionary for chatbot widget.

import { useMemo } from 'react';

export const DICTIONARIES = {
  vi: {
    ready: 'Mia sẵn sàng hỗ trợ',
    close: 'Đóng',
    assistant: 'Mia - Trợ lý AI',
    subtitle: 'Hỗ trợ mua sắm thông minh',
    welcome: 'Em là trợ lý mua sắm AI, có thể giúp bạn tìm kiếm sản phẩm, tư vấn thời trang, hoặc trả lời các câu hỏi về đơn hàng.',
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
    dialogLabel: 'Mia - AI Chat Assistant',
    closeDialogLabel: 'Đóng Mia - Trợ lý AI',
    cskhSupport: 'Gặp tư vấn viên',
    scrollToBottom: 'Xuống tin nhắn mới',
  },
  en: {
    ready: 'Mia is ready to help',
    close: 'Close',
    assistant: 'Mia - AI Assistant',
    subtitle: 'Smart shopping assistant',
    welcome: 'I am your AI shopping assistant. I can help you find products, give fashion advice, or answer order questions.',
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
    dialogLabel: 'Mia - AI Chat Assistant',
    closeDialogLabel: 'Close Mia - AI Assistant',
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
