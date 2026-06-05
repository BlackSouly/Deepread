export function Button({ children, variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  const variants = {
    primary: 'bg-brand-500 text-white shadow-sm hover:bg-brand-900',
    secondary: 'bg-white text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] shadow-sm hover:bg-[var(--color-background-tertiary)]',
    ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]',
    warning: 'bg-signal-orange text-white shadow-sm hover:bg-[#BA4825]',
  }

  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-10 px-4 text-[13px]',
    lg: 'h-11 px-5 text-[14px]',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
