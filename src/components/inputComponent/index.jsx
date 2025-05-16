import "./inputComponent.scss";

export default function InputComponent({
  text,
  required = false,
  className,
  type,
  placeholder,
  value,
  onChange,
  icon, // Replace `img` with a dynamic icon component
  name,
}) {
  return (
    <div className={`inputComponent ${className}`}>
      <label htmlFor={text}>
        {text}
        {required && <span>*</span>}
      </label>
      <div className="inputWrapper">
        <input
          id={text}
          type={type}
          required={required}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
        />
        {icon && <span className="inputIcon">{icon}</span>}
      </div>
      {type === "password" && (
        <p>
          Must contain at least 1 upper case letter, 1 lower case letter,
          numbers, and symbols (!@#$)
        </p>
      )}
    </div>
  );
}
