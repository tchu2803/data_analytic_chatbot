import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Shield, Lock, CheckCircle, XCircle } from "lucide-react";
import FormWrapper from "./common/FormWrapper";
import InputField from "./common/InputField";
import { api } from "./services/api";
import { handleError } from "./services/errorHandler";
import styles from "./styles/ResetPassword.module.css";

const ResetPassword = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get("token") || "";
  const email = query.get("email") || "";
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const id = query.get("id") ? Number(query.get("id")) : "";

  const password = watch("password");

  useEffect(() => {
    const validateToken = async () => {
      try {
        const { ok, data } = await api.validateResetToken(token);
        if (!ok) {
          setMessage(data.message || "Token không hợp lệ hoặc đã hết hạn.");
          setIsSuccess(false);
        }
      } catch (error) {
        handleError(error, setMessage);
      }
    };
    if (token) validateToken();
  }, [token]);

  useEffect(() => {
    if (!id) {
      setMessage("Thiếu thông tin người dùng. Không thể đặt lại mật khẩu.");
      setIsSuccess(false);
      navigate('/login')
    }
  }, [id]);

  const getPasswordStrength = (pwd) => {
    if (pwd.length < 6)
      return { strength: "Weak", color: "text-danger", width: "25%" };
    if (pwd.length < 8)
      return { strength: "Fair", color: "text-warning", width: "50%" };
    if (pwd.length < 12)
      return { strength: "Good", color: "text-info", width: "75%" };
    return { strength: "Strong", color: "text-success", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(password || "");

  const onSubmit = async (data) => {
    if(!id) return navigate('/login')
    setIsLoading(true);
    setMessage("");
    try {
      const { ok, data: responseData } = await api.resetPassword(
        token,
        email,
        data.password,
        data.confirm,
        Number(id)
      );
      if (ok) {
        setMessage("Password has been reset successfully!");
        setIsSuccess(true);
      } else {
        throw new Error(responseData.message || "Reset failed");
      }
    } catch (error) {
      handleError(error, setMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper
      title="Reset Password"
      icon={<Shield className="text-white" size={70} />}
      footer={
        <div className="text-center">
          <p className="small text-muted mb-0">
            Remember your password?{" "}
            <Link
              to="/login"
              className="btn btn-link p-0 text-decoration-none fw-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      }
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-medium">
              New Password
            </label>
            <InputField
              icon={<Lock size={32} className="text-muted" />}
              type="password"
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword(!showPassword)}
              placeholder="Enter new password"
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự",
                },
              })}
            />
            {errors.password && (
              <small className="text-danger">{errors.password.message}</small>
            )}
            {password && (
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center">
                  <small className={passwordStrength.color}>
                    Password strength: {passwordStrength.strength}
                  </small>
                </div>
                <div className={styles.passwordStrength}>
                  <div
                    className={`${
                      styles.passwordStrengthBar
                    } bg-${passwordStrength.color.replace("text-", "")}`}
                    style={{ width: passwordStrength.width }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirm" className="form-label fw-medium">
              Confirm Password
            </label>
            <InputField
              icon={<Lock size={32} className="text-muted" />}
              type="password"
              showPassword={showConfirm}
              toggleShowPassword={() => setShowConfirm(!showConfirm)}
              placeholder="Confirm new password"
              {...register("confirm", {
                required: "Xác nhận mật khẩu là bắt buộc",
                validate: (value) =>
                  value === password || "Mật khẩu không khớp",
              })}
            />
            {errors.confirm && (
              <small className="text-danger">{errors.confirm.message}</small>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.btnGradient} btn text-white w-100 py-3 fw-medium`}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Resetting...
              </>
            ) : (
              <>
                <Shield size={28} className="me-2" />
                Reset Password
              </>
            )}
          </button>

          {message && (
            <div
              className={`alert mt-4 d-flex align-items-center ${
                isSuccess ? "alert-success" : "alert-danger"
              }`}
            >
              {isSuccess ? (
                <CheckCircle size={28} className="text-success me-2" />
              ) : (
                <XCircle size={28} className="text-danger me-2" />
              )}
              <span className="small fw-medium">{message}</span>
            </div>
          )}
        </form>
      ) : (
        <div className="text-center">
          <div className={styles.iconCircleSuccess}>
            <CheckCircle size={70} className="text-success" />
          </div>
          <h3 className="h4 fw-bold mb-3">Password Reset Successfully!</h3>
          <p className="text-muted small mb-4">
            Your password has been reset successfully. You can now sign in with
            your new password.
          </p>
          <Link
            to="/login"
            className={`${styles.btnGradient} btn text-white px-5 py-3 fw-medium`}
          >
            Sign In Now
          </Link>
        </div>
      )}
    </FormWrapper>
  );
};

export default ResetPassword;
