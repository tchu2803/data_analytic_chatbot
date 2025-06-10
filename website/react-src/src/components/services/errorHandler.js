export const handleError = (error, setMessage) => {
  setMessage(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
};