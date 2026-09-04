import React from "react";
import styles from "./OnboardingProgress.module.css";

interface OnboardingProgressProps {
  currentStep?: number;
  totalSteps?: number;
}

export function OnboardingProgress({
  currentStep = 1,
  totalSteps = 6,
}: OnboardingProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div
      className={styles.progressContainer}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Onboarding progress: Step ${currentStep} of ${totalSteps}`}
    >
      <span className={styles.stepLabel}>
        Step {currentStep} of {totalSteps}
      </span>

      <div className={styles.track}>
        {steps.map((step, index) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          const isPending = step > currentStep;

          return (
            <React.Fragment key={step}>
              {/* Step Node */}
              <div
                className={[
                  styles.node,
                  isActive ? styles.activeNode : "",
                  isCompleted ? styles.completedNode : "",
                  isPending ? styles.pendingNode : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              >
                {isCompleted ? (
                  <svg
                    className={styles.checkIcon}
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className={styles.nodeDot} />
                )}
              </div>

              {/* Connecting Line (except after last node) */}
              {index < totalSteps - 1 && (
                <div
                  className={[
                    styles.connector,
                    step < currentStep ? styles.activeConnector : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
