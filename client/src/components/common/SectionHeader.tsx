interface Props {
  title: string;
  subtitle?: string;
  className?: string;
  id?: string;
}

export default function SectionHeader({ title, subtitle, className = '', id }: Props) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 id={id} className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <div className="w-12 h-1 bg-primary-600 rounded-full mt-3" aria-hidden="true" />
    </div>
  );
}
