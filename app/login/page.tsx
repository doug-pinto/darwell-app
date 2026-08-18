import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[54%_46%]">
        {/* LEFT — Brand panel */}
        <section className="relative hidden overflow-hidden bg-[#0d172b] px-14 py-14 text-white lg:flex lg:flex-col">

          {/* Main content */}
          <div className="relative z-10 my-auto max-w-xl">
            <p className="mb-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#aabfff]">
              Espace client
            </p>

            <h1 className="max-w-lg text-6xl font-semibold leading-[1.05] tracking-[-0.04em]">
              Vos formations,
              <br />
              audits et
              <br />
              livrables
              <span className="text-[#aebcff]">.</span>
            </h1>

            <p className="mt-9 max-w-lg text-lg leading-8 text-[#96a5bf]">
              Un accès unique à vos parcours de formation, vos rapports
              d&apos;audit IA et les ressources partagées par votre équipe
              Darwell.
            </p>
          </div>


          {/* Bottom badges */}
          <div className="relative z-10 flex gap-3">
            <div className="rounded-full border border-[#65708a]/50 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#aebcff]">
              Certifié Qualiopi
            </div>

            <div className="rounded-full border border-[#65708a]/50 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#9ba8bf]">
              Données hébergées en Europe
            </div>
          </div>
        </section>

        {/* RIGHT — Authentication */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-20">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-10 flex justify-start">
              <Image
                src="/darwell-logo.png"
                alt="Darwell"
                width={170}
                height={50}
                priority
                className="h-auto w-[150px] -translate-x-4"
              />
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-semibold tracking-[-0.03em] text-black">
                Se connecter
              </h2>

              
            </div>

            <LoginForm />

            <div className="mt-9 border-t border-[#e3e8ef] pt-7">
              <p className="text-sm leading-6 text-[#667896]">
                Accès réservé aux clients Darwell. Les comptes sont créés par
                notre équipe —{" "}
                <a
                  href="mailto:contact@darwell.ai"
                  className="font-medium text-[#2412d8] transition hover:opacity-70"
                >
                  contacter Darwell.
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}