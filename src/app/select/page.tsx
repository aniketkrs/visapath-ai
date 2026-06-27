"use client";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function SelectPage() {
  const router = useRouter();

  const visaTypes = [
    {
      id: "B1_B2",
      title: "B-1/B-2",
      subtitle: "Tourist & Business Visitor",
      emoji: "🇺🇸",
      description: "Tourism, business meetings, medical treatment, family visits, conferences",
      available: true,
      tag: "Most popular",
    },
    {
      id: "F1",
      title: "F-1",
      subtitle: "Student Visa",
      emoji: "🎓",
      description: "University study, language programs, academic research",
      available: false,
      tag: "Coming soon",
    },
    {
      id: "H1B",
      title: "H-1B",
      subtitle: "Work Visa",
      emoji: "💼",
      description: "Specialty occupation employment, tech workers",
      available: false,
      tag: "Coming soon",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3 animate-fade-in">
          Select your visa type
        </h1>
        <p className="text-[var(--text-secondary)] animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Choose the visa category you&apos;re applying for
        </p>
      </div>

      <div className="grid gap-4">
        {visaTypes.map((visa, i) => (
          <Card
            key={visa.id}
            hover={visa.available}
            onClick={() => visa.available && router.push("/intake")}
            className={`animate-slide-up ${!visa.available ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{visa.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold">{visa.title}</h2>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      visa.available
                        ? "bg-[var(--score-strong)]/20 text-[var(--score-strong)]"
                        : "bg-[var(--bg-mid)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {visa.tag}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-bright)] mb-1">
                  {visa.subtitle}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {visa.description}
                </p>
              </div>
              {visa.available && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--trust-blue)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
