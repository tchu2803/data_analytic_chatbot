import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Lock, UserPlus, Check, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import InputField from "./common/InputField";
import FormWrapper from "./common/FormWrapper";
import { api } from "./services/api";
import styles from "./styles/Register.module.css";

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password");

  const getPasswordStrength = useCallback((pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  }, []);

  const getStrengthColor = useCallback((strength) => {
    if (strength <= 2) return "bg-danger";
    if (strength <= 3) return "bg-warning";
    return "bg-success";
  }, []);

  const getStrengthText = useCallback((strength) => {
    if (strength <= 2) return "Yếu";
    if (strength <= 3) return "Trung bình";
    return "Mạnh";
  }, []);

  const getStrengthTextColor = useCallback((strength) => {
    if (strength <= 2) return "text-danger";
    if (strength <= 3) return "text-warning";
    return "text-success";
  }, []);

  const passwordStrength = getPasswordStrength(password || "");

  const onSubmit = useCallback(async (data) => {
    setIsLoading(true);
    setMessage("");
    try {
      const { ok, data: responseData } = await api.register(data.name, data.email, data.password);
      if (ok) {
        setMessage("Đăng ký thành công! Chào mừng bạn đến với chúng tôi.");
        setIsSuccess(true);
        toast.success("Đăng ký thành công!");
        setTimeout(() => {
          reset();
        }, 2000);
      } else {
        throw new Error(responseData.message || "Đăng ký thất bại");
      }
    } catch (error) {
      const errorMsg = error.message || "Đăng ký thất bại";
      setMessage(errorMsg);
      toast.error(errorMsg);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  return (
    <FormWrapper
      title="Tạo Tài Khoản Mới"
      icon={<UserPlus className="text-white" size={70} />}
      footer={
        <div className="text-center">
          <p className="small text-muted mb-0">
            Đã có tài khoản?{" "}
            <Link to="/login" className="btn btn-link p-0 text-decoration-none fw-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      }
      wrapperClass={styles.bgGradientRegister}
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className="mb-4">
          <label htmlFor="name" className="form-label fw-medium">
            Họ và Tên
          </label>
          <InputField
            icon={<User size={24} className="text-muted" />}
            type="text"
            placeholder="Nhập họ và tên"
            {...register("name", { required: "Họ và tên là bắt buộc" })}
          />
          {errors.name && <small className="text-danger mt-2 d-block">{errors.name.message}</small>}
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="form-label fw-medium">
            Email
          </label>
          <InputField
            icon={<Mail size={24} className="text-muted" />}
            type="email"
            placeholder="Nhập địa chỉ email"
            {...register("email", {
              required: "Email là bắt buộc",
              pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" },
            })}
          />
          {errors.email && <small className="text-danger mt-2 d-block">{errors.email.message}</small>}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="form-label fw-medium">
            Mật khẩu
          </label>
          <InputField
            icon={<Lock size={24} className="text-muted" />}
            type="password"
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword(!showPassword)}
            placeholder="Tạo mật khẩu"
            {...register("password", {
              required: "Mật khẩu là bắt buộc",
              minLength: { value: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
            })}
          />
          {errors.password && <small className="text-danger mt-2 d-block">{errors.password.message}</small>}
          {password && (
            <div className="mt-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">Độ mạnh mật khẩu:</small>
                <small className={getStrengthTextColor(passwordStrength)}>
                  {getStrengthText(passwordStrength)}
                </small>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${getStrengthColor(passwordStrength)}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="form-label fw-medium">
            Xác nhận Mật khẩu
          </label>
          <InputField
            icon={<Lock size={24} className="text-muted" />}
            type="password"
            showPassword={showConfirmPassword}
            toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            placeholder="Nhập lại mật khẩu"
            {...register("confirmPassword", {
              required: "Xác nhận mật khẩu là bắt buộc",
              validate: (value) => value === password || "Mật khẩu không khớp",
            })}
          />
          {errors.confirmPassword && <small className="text-danger mt-2 d-block">{errors.confirmPassword.message}</small>}
        </div>
        <div className="mb-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="terms"
              {...register("acceptTerms", { required: "Vui lòng đồng ý với điều khoản dịch vụ" })}
            />
            <label className="form-check-label text-muted" htmlFor="terms">
              Tôi đồng ý với{" "}
              <a href="#" className="text-primary text-decoration-none">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-primary text-decoration-none">
                Chính sách bảo mật
              </a>
            </label>
          </div>
          {errors.acceptTerms && <small className="text-danger mt-2 d-block">{errors.acceptTerms.message}</small>}
        </div>
        <button
          type="submit"
          className={`${styles.btnGradient} btn text-white w-100 py-3 fw-medium d-flex align-items-center justify-content-center`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Đang đăng ký...
            </>
          ) : (
            <>
              <UserPlus className="me-2" size={20} />
              Tạo tài khoản
            </>
          )}
        </button>
        {message && (
          <div className={`alert mt-4 d-flex align-items-center ${isSuccess ? "alert-success" : "alert-danger"}`}>
            {isSuccess ? (
              <Check size={20} className="text-success me-2" />
            ) : (
              <XCircle size={20} className="text-danger me-2" />
            )}
            <span className="small fw-medium">{message}</span>
          </div>
        )}
      </form>
    </FormWrapper>
  );
};

export default Register;