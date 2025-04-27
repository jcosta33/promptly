import React from "react";
import styles from "./Select.module.css";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectSize = "sm" | "md" | "lg";

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "size"
> & {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  size?: SelectSize;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  className?: string;
  fullWidth?: boolean;
};

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = "Select an option",
  onChange,
  size = "md",
  disabled = false,
  error = false,
  errorMessage,
  label,
  className = "",
  fullWidth = false,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div
      className={`
        ${styles.selectWrapper} 
        ${fullWidth ? styles.fullWidth : ""} 
        ${className}
      `}
      data-promptly-select-size={size}
    >
      {label && (
        <label
          className={styles.label}
          data-promptly-select-disabled={disabled}
          htmlFor={rest.id || "promptly-select"}
        >
          {label}
        </label>
      )}

      <div className={styles.selectContainer}>
        <select
          className={styles.select}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          data-promptly-select-error={error}
          data-promptly-select-size={size}
          id={rest.id || "promptly-select"}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </div>
  );
};

Select.displayName = "Select";
