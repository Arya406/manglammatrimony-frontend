"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import styles from "./CustomSelect.module.css";

export interface SelectOption {
  value: string;
  label: string;
  secondaryLabel?: string;
}

interface CustomSelectProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  isSearchable?: boolean;
  searchPlaceholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  id?: string;
}

export function CustomSelect({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  isSearchable = false,
  searchPlaceholder = "Search...",
  error,
  required = false,
  disabled = false,
  helperText,
  id: customId,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = isSearchable && searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.secondaryLabel && opt.secondaryLabel.toLowerCase().includes(searchQuery.toLowerCase()))
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
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Tab":
        setIsOpen(false);
        setSearchQuery("");
        break;
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

      {/* Trigger Button */}
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
          !selectedOption ? styles.triggerPlaceholder : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={styles.triggerValue}>
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption?.secondaryLabel && (
            <span className={styles.secondaryLabel}>
              {" "}
              ({selectedOption.secondaryLabel})
            </span>
          )}
        </span>

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
          {isSearchable && (
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className={styles.searchInput}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <ul
            id={`${selectId}-listbox`}
            role="listbox"
            ref={listboxRef}
            className={styles.optionsList}
          >
            {filteredOptions.length === 0 ? (
              <li className={styles.noResults}>No options found</li>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(opt.value);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={[
                      styles.option,
                      isSelected ? styles.optionSelected : "",
                      isHighlighted ? styles.optionHighlighted : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className={styles.optionLabel}>
                      {opt.label}
                      {opt.secondaryLabel && (
                        <span className={styles.optionSecondary}>
                          {" "}
                          ({opt.secondaryLabel})
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <svg
                        className={styles.checkIcon}
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
                          clipRule="evenodd"
                        />
                      </svg>
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
