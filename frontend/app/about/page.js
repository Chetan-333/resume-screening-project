import { PageHeader } from "../../components/PageHeader";
import { Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        title="About Resume Screening"
        subtitle="Learn more about the platform."
      />
      
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Our Mission</h3>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          We aim to revolutionize the hiring process by providing intelligent, AI-driven insights that bridge the gap between candidates and opportunities. Our platform helps recruiters find the right talent efficiently while empowering applicants to showcase their true potential.
        </p>
      </div>
    </div>
  );
}
