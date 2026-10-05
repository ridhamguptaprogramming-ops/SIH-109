export const LoadingState = ({ message = 'Loading Pashu Mitra health telemetry...' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  )
}
