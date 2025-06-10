import styles from '../styles/FormWrapper.module.css';

const FormWrapper = ({ title, icon, children, footer }) => (
  <div className={styles.bgGradient}>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6 color">
          <div className={styles.cardShadow}>
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className={styles.iconCircle}>{icon}</div>
                <h2 className="card-title fw-bold mb-2">{title}</h2>
              </div>
              {children}
              <hr className="my-4" />
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FormWrapper;