import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Mail, Send, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import FormWrapper from "./common/FormWrapper";
import InputField from "./common/InputField";
import { api } from "./services/api";
import styles from "./styles/ForgotPassword.module.css";

const ForgotPassword = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = useCallback(async (data) => {
    setIsLoading(true);
    setMessage("");
    try {
      const { ok, data: responseData } = await api.forgotPassword(data.email);
      if (ok) {
        setMessage(data.email);
        setIsSuccess(true);
        toast.success("Link đặt lại mật khẩu đã được gửi!");
      } else {
        throw new Error(responseData.message || "Không thể gửi link đặt lại mật khẩu");
      }
    } catch (error) {
      const errorMsg = error.message || "Không thể gửi link đặt lại mật khẩu";
      setMessage(errorMsg);
      toast.error(errorMsg);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    reset();
    setMessage("");
    setIsSuccess(false);
  }, [reset]);

  return (
    <FormWrapper
      title="Quên Mật Khẩu?"
      icon={<Mail className="text-white" size={70} />}
      footer={
        <div className="text-center">
          <p className="small text-muted mb-0">
            Đã nhớ mật khẩu?{" "}
            <Link to="/login" className="btn btn-link p-0 text-decoration-none fw-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      }
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className="mb-4">
            <label htmlFor="email" className="form-label fw-medium">
              Địa chỉ Email
            </label>
            <InputField
              icon={<Mail size={24} className="text-muted" />}
              type="email"
              placeholder="Nhập địa chỉ email của bạn"
              {...register("email", {
                required: "Email là bắt buộc",
                pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" },
              })}
            />
            {errors.email && <small className="text-danger mt-1 d-block">{errors.email.message}</small>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.btnGradient} btn text-white w-100 py-3 fw-medium d-flex align-items-center justify-content-center`}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang gửi...
              </>
            ) : (
              <>
                <Send size={20} className="me-2" />
                Gửi Link Đặt Lại
              </>
            )}
          </button>
          {message && (
            <div className={`alert mt-4 d-flex align-items-center ${isSuccess ? "alert-success" : "alert-danger"}`}>
              {isSuccess ? <CheckCircle size={20} className="text-success me-2" /> : <XCircle size={20} className="text-danger me-2" />}
              <span className="small fw-medium">{message}</span>
            </div>
          )}
        </form>
      ) : (
        <div className="text-center">
          <div className={styles.iconCircleSuccess}>
            <CheckCircle size={70} className="text-success" />
          </div>
          <h3 className="h5 fw-bold mb-3">Gửi Email Thành Công!</h3>
          <p className="text-muted small mb-4">
            Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
            <span className="fw-medium">{message}</span>.
          </p>
          <button
            onClick={resetForm}
            className="btn btn-link text-decoration-none p-0 mt-3 d-flex align-items-center mx-auto"
          >
            <ArrowLeft size={16} className="me-1" />
            Gửi đến email khác
          </button>
        </div>
      )}
    </FormWrapper>
  );
};

export default ForgotPassword;