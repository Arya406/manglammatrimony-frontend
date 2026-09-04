"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { SelectOption } from "./CustomSelect";
import styles from "./CustomMultiSelect.module.css";

interface CustomMultiSelectProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export function CustomMultiSelect({
  label,
  placeholder = "Select languages...",
  options,
  values,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  id: customId,
}: CustomMultiSelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((opt) => values.includes(opt.value));

  const filteredOptions = searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleOption = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((v) => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  const handleRemoveChip = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== optionValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setIsOpen(true);
    } else if (isOpen && e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div
      className={[
        styles.container,
        error ? styles.hasError : "",
        disabled ? styles.disabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={containerRef}
    >
      <label htmlFor={selectId} className={styles.label}>
        {label}
        {required && <span className={styles.requiredStar}> *</span>}
      </label>

      {/* Trigger Box */}
      <div
        id={selectId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${selectId}-listbox`}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={[
          styles.trigger,
          isOpen ? styles.triggerOpen : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.chipsOrPlaceholder}>
          {selectedOptions.length === 0 ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            <div className={styles.chipsContainer}>
              {selectedOptions.map((opt) => (
                <span key={opt.value} className={styles.chip}>
                  <span>{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveChip(opt.value, e)}
                    className={styles.chipRemoveButton}
                    aria-label={`Remove ${opt.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <svg
          className={[styles.chevron, isOpen ? styles.chevronOpen : ""]
            .filter(Boolean)
            .join(" ")}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search languages..."
              className={styles.searchInput}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <ul
            id={`${selectId}-listbox`}
            role="listbox"
            aria-multiselectable="true"
            className={styles.optionsList}
          >
            {filteredOptions.length === 0 ? (
              <li className={styles.noResults}>No languages found</li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = values.includes(opt.value);

                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleOption(opt.value);
                    }}
                    className={[
                      styles.option,
                      isSelected ? styles.optionSelected : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className={styles.checkbox}
                        aria-hidden="true"
                      />
                      <span className={styles.optionLabel}>{opt.label}</span>
                    </div>

                    {isSelected && (
                      <span className={styles.checkBadge}>Selected</span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && <span className={styles.errorMessage}>{error}</span>}
      {!error && helperText && (
        <span className={styles.helperMessage}>{helperText}</span>
      )}
    </div>
  );
}
