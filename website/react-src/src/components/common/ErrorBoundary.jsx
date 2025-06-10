import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="alert alert-danger">Có lỗi xảy ra. Vui lòng thử lại.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;