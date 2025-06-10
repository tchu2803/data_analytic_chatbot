import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, LogIn, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import FormWrapper from "./common/FormWrapper";
import InputField from "./common/InputField";
import { api } from "./services/api";
import styles from "./styles/Login.module.css";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const onSubmit = useCallback(async (data) => {
    setIsLoading(true);
    setMessage("");
    try {
      const { ok, data: responseData } = await api.login(data.email, data.password);
      if (ok) {
        localStorage.setItem("token", responseData.token);
        setMessage("Đăng nhập thành công!");
        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        throw new Error(responseData.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      const errorMsg = error.message || "Đăng nhập thất bại";
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return (
    <FormWrapper
      title="Chào Mừng Trở Lại"
      icon={<LogIn className="text-white" size={70} />}
      footer={
        <div className="text-center">
          <p className="small text-muted mb-0">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="btn btn-link p-0 text-decoration-none fw-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className="mb-4">
          <label htmlFor="email" className="form-label fw-medium">
            Email
          </label>
          <InputField
            icon={<Mail size={24} className="text-muted" />}
            type="email"
            placeholder="Nhập email của bạn"
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
            placeholder="Nhập mật khẩu"
            {...register("password", {
              required: "Mật khẩu là bắt buộc",
              minLength: { value: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
            })}
          />
          {errors.password && <small className="text-danger mt-2 d-block">{errors.password.message}</small>}
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="rememberMe" />
            <label className="form-check-label text-muted" htmlFor="rememberMe">
              Ghi nhớ đăng nhập
            </label>
          </div>
          <Link to="/forgot-password" className="text-primary text-decoration-none fw-medium">
            Quên mật khẩu?
          </Link>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.btnGradient} btn text-white w-100 py-3 fw-medium d-flex align-items-center justify-content-center`}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Đang đăng nhập...
            </>
          ) : (
            <>
              <LogIn className="me-2" size={20} />
              Đăng nhập
            </>
          )}
        </button>
        {message && (
          <div className={`alert mt-4 d-flex align-items-center ${message.includes("thành công") ? "alert-success" : "alert-danger"}`}>
            {message.includes("thành công") ? (
              <CheckCircle size={20} className="text-success me-2" />
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

export default Login;