type ReconciliationMetricName =
    | "headChecks"
    | "debouncedChecks"
    | "headSuccess"
    | "headMissing"
    | "headProviderErrors"
    | "failedAfterExpiry"

type ReconciliationMetrics = Record<ReconciliationMetricName, number>

const metrics: ReconciliationMetrics = {
    headChecks: 0,
    debouncedChecks: 0,
    headSuccess: 0,
    headMissing: 0,
    headProviderErrors: 0,
    failedAfterExpiry: 0,
}

export function incrementReconciliationMetric( name: ReconciliationMetricName ): void {
    metrics[name] += 1
}

export function getReconciliationMetrics(): ReconciliationMetrics {
    return { ...metrics }
}
