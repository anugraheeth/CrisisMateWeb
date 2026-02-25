interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    featured?: boolean;
    accent?: 'brand' | 'danger' | 'success' | 'warning';
}

const accentMap = {
    brand: {
        iconBg: 'bg-brand-50',
        iconText: 'text-brand-600',
        hoverBorder: 'hover:border-brand-200',
        tag: 'bg-brand-50 text-brand-600',
    },
    danger: {
        iconBg: 'bg-red-50',
        iconText: 'text-danger',
        hoverBorder: 'hover:border-red-200',
        tag: 'bg-red-50 text-danger',
    },
    success: {
        iconBg: 'bg-green-50',
        iconText: 'text-success',
        hoverBorder: 'hover:border-green-200',
        tag: 'bg-green-50 text-success',
    },
    warning: {
        iconBg: 'bg-amber-50',
        iconText: 'text-warning',
        hoverBorder: 'hover:border-amber-200',
        tag: 'bg-amber-50 text-warning',
    },
};

const FeatureCard = ({
    icon,
    title,
    description,
    featured = false,
    accent = 'brand',
}: FeatureCardProps) => {
    const colors = accentMap[accent];

    return (
        <div
            className={`bento-card group relative overflow-hidden ${featured ? 'md:col-span-2 md:row-span-1' : ''
                } ${colors.hoverBorder}`}
        >
            {/* Decorative corner gradient */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-100/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Icon */}
            <div
                className={`w-14 h-14 rounded-2xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
            >
                <span className="material-symbols-outlined text-[28px]">
                    {icon}
                </span>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-ink-900 mb-2 tracking-tight">
                {title}
            </h3>
            <p className="text-sm text-ink-500 leading-relaxed">
                {description}
            </p>

            {/* Bottom arrow indicator */}
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-ink-400 group-hover:text-brand-600 transition-colors">
                <span>Learn more</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                </span>
            </div>
        </div>
    );
};

export default FeatureCard;
