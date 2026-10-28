import numpy as np
import pandas as pd
from typing import Dict

def compute_conformal_calibration_factor(
    y_cal: np.ndarray,
    y_pred_mean: np.ndarray,
    y_pred_std: np.ndarray,
    nominal_coverage: float = 0.90
) -> float:
    """
    Computes the empirical conformal quantile multiplier q_hat on a held-out calibration set.
    Non-conformity score: s_i = |y_i - mu_i| / (sigma_i + eps).
    Guarantees finite-sample coverage >= nominal_coverage on exchangeable test distributions.
    """
    eps = 1e-4
    residuals = np.abs(np.asarray(y_cal) - np.asarray(y_pred_mean))
    std = np.maximum(np.asarray(y_pred_std), eps)
    scores = residuals / std
    n = len(scores)
    # Finite-sample conformal quantile: ceil((n+1) * (1-alpha)) / n
    alpha = 1.0 - nominal_coverage
    q_level = min(1.0, np.ceil((n + 1) * (1.0 - alpha)) / n)
    q_hat = float(np.quantile(scores, q_level))
    return max(1.0, q_hat)

def compute_calibration_score(
    y_true: np.ndarray,
    y_pred_mean: np.ndarray,
    y_pred_std: np.ndarray,
    confidence_level: float = 0.95,
    q_multiplier: float = None
) -> float:
    """
    Evaluates uncertainty calibration. Returns the empirical coverage percentage.
    If q_multiplier is provided, uses conformalized intervals; otherwise uses Gaussian z-score.
    """
    from scipy.stats import norm
    
    if q_multiplier is not None:
        multiplier = q_multiplier
    else:
        multiplier = norm.ppf((1 + confidence_level) / 2)
        
    lower_bound = y_pred_mean - multiplier * y_pred_std
    upper_bound = y_pred_mean + multiplier * y_pred_std
    
    within_bounds = (y_true >= lower_bound) & (y_true <= upper_bound)
    return float(np.mean(within_bounds))

def evaluate_reliability_by_lead_time(
    y_true: np.ndarray, 
    y_pred_mean: np.ndarray, 
    y_pred_std: np.ndarray, 
    lead_times: np.ndarray
) -> Dict[int, float]:
    """
    Calculates calibration score stratified by forecast lead time (e.g., day 1 to day 14).
    As lead time increases, prediction intervals should naturally widen to maintain coverage.
    """
    unique_leads = np.unique(lead_times)
    reliability_report = {}
    
    for lead in unique_leads:
        mask = lead_times == lead
        if np.sum(mask) > 0:
            coverage = compute_calibration_score(y_true[mask], y_pred_mean[mask], y_pred_std[mask])
            reliability_report[int(lead)] = coverage
            
    return reliability_report

def evaluate_seasonal_reliability(
    df: pd.DataFrame, 
    true_col: str = 'y_true', 
    pred_col: str = 'y_pred', 
    std_col: str = 'y_std', 
    date_col: str = 'timestamp'
) -> Dict[str, float]:
    """
    Stratifies uncertainty calibration by Khulna's distinct hydrological seasons:
    - Monsoon / High Flow (June - October)
    - Dry / Saline Intrusion (November - May)
    """
    df['month'] = pd.to_datetime(df[date_col]).dt.month
    
    monsoon_mask = df['month'].isin([6, 7, 8, 9, 10])
    dry_mask = ~monsoon_mask
    
    report = {}
    
    if monsoon_mask.sum() > 0:
        report['monsoon_coverage'] = compute_calibration_score(
            df.loc[monsoon_mask, true_col].values,
            df.loc[monsoon_mask, pred_col].values,
            df.loc[monsoon_mask, std_col].values
        )
        
    if dry_mask.sum() > 0:
        report['dry_coverage'] = compute_calibration_score(
            df.loc[dry_mask, true_col].values,
            df.loc[dry_mask, pred_col].values,
            df.loc[dry_mask, std_col].values
        )
        
    return report
