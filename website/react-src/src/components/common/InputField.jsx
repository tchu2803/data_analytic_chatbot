import { Eye, EyeOff } from 'lucide-react';
import styles from '../styles/InputField.module.css';

const InputField = ({ icon, type, showPassword, toggleShowPassword, ...props }) => (
  <div className="input-group">
    {icon && <span className={styles.inputGroupText}>{icon}</span>}
    <input
      type={showPassword ? 'text' : type}
      className={`form-control ${styles.formControl}`}
      {...props}
    />
    {type === 'password' && (
      <span className={styles.inputGroupText} onClick={toggleShowPassword}>
        {showPassword ? <EyeOff size={24} className="text-muted" /> : <Eye size={24} className="text-muted" />}
      </span>
    )}
  </div>
);

export default InputField;