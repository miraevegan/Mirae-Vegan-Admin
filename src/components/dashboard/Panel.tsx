import { motion } from "framer-motion";

export default function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface border border-border rounded-2xl"
    >
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-brand text-sm tracking-wide uppercase">
          {title}
        </h2>
      </div>

      <div className="p-6 space-y-3">
        {children}
      </div>
    </motion.section>
  );
}
