"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { PlatformHeader } from "@/components/platform-header";
import { PlatformFooter } from "@/components/platform-footer";
import { slugifyCompanyName } from "@/lib/platform";
import { readApiJson } from "@/lib/http";
import { normalizePhone } from "@/lib/phone";

type Success = {
  sitePath: string;
  siteUrl: string;
  gestorUrl: string;
  email: string;
  companyName: string;
  emailSent: boolean;
  emailError?: string | null;
};

type FieldErrors = Partial<
  Record<
    | "companyName"
    | "slug"
    | "adminName"
    | "adminEmail"
    | "adminPassword"
    | "whatsapp"
    | "phone",
    string
  >
>;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateFields(input: {
  companyName: string;
  slug: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  whatsapp: string;
  phone: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const companyName = input.companyName.trim();
  const slug = input.slug.trim();
  const adminName = input.adminName.trim();
  const adminEmail = input.adminEmail.trim();
  const adminPassword = input.adminPassword;
  const whatsappDigits = normalizePhone(input.whatsapp);
  const phoneDigits = normalizePhone(input.phone);

  if (companyName.length < 2) {
    errors.companyName = "Informe o nome da estética (mín. 2 caracteres).";
  }
  if (slug.length < 2) {
    errors.slug = "Informe o endereço do site (mín. 2 caracteres).";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug =
      "Use só letras minúsculas, números e hífen (sem começar/terminar com hífen).";
  }
  if (adminName.length < 2) {
    errors.adminName = "Informe seu nome (mín. 2 caracteres).";
  }
  if (!adminEmail) {
    errors.adminEmail = "Informe o e-mail de acesso.";
  } else if (!isValidEmail(adminEmail)) {
    errors.adminEmail = "E-mail inválido. Ex: voce@empresa.com";
  }
  if (adminPassword.length < 6) {
    errors.adminPassword = "A senha precisa ter pelo menos 6 caracteres.";
  } else if (adminPassword.length > 72) {
    errors.adminPassword = "A senha pode ter no máximo 72 caracteres.";
  }
  if (input.whatsapp.trim() && whatsappDigits.length < 10) {
    errors.whatsapp = "WhatsApp inválido. Use DDD + número (mín. 10 dígitos).";
  }
  if (input.phone.trim() && phoneDigits.length < 10) {
    errors.phone = "Telefone inválido. Use DDD + número (mín. 10 dígitos).";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-red-300">{message}</span>;
}

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<Success | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugifyCompanyName(companyName));
    }
  }, [companyName, slugTouched]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const nextErrors = validateFields({
      companyName,
      slug,
      adminName,
      adminEmail,
      adminPassword,
      whatsapp,
      phone,
    });
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Revise os campos destacados antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/platform/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          slug: slug.trim(),
          adminName: adminName.trim(),
          adminEmail: adminEmail.trim(),
          adminPassword,
          phone: phone.trim() || undefined,
          whatsapp: (whatsapp || phone).trim() || undefined,
          planCode: "FREE",
        }),
      });
      const data = await readApiJson<{
        error?: string;
        sitePath?: string;
        siteUrl?: string;
        gestorUrl?: string;
        emailSent?: boolean;
        emailError?: string | null;
        company?: { name: string };
      }>(res);
      if (!res.ok) {
        throw new Error(data.error || "Falha no cadastro");
      }
      if (!data.sitePath || !data.company?.name) {
        throw new Error("Cadastro incompleto. Tente novamente.");
      }
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      setSuccess({
        sitePath: data.sitePath,
        siteUrl: data.siteUrl || `${origin}${data.sitePath}`,
        gestorUrl: data.gestorUrl || `${origin}/gestor/login`,
        email: adminEmail.trim(),
        companyName: data.company.name,
        emailSent: Boolean(data.emailSent),
        emailError: data.emailError ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (hasError?: string) =>
    `mt-1 w-full rounded-xl border bg-black/40 px-3 py-2.5 text-white outline-none focus:border-brand-gold ${
      hasError ? "border-red-400/50" : "border-white/15"
    }`;

  return (
    <div className="flex min-h-full flex-col">
      <PlatformHeader />
      <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_#0b2a8f_0%,_#050914_55%)] px-5 py-12">
        {success ? (
          <div className="w-full max-w-lg space-y-5 rounded-[1.75rem] border border-brand-gold/30 bg-black/35 p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
              Conta criada
            </p>
            <h1 className="font-display text-4xl text-white">
              {success.companyName} no ar
            </h1>
            <p className="text-sm text-white/70">
              Seu plano FREE já está ativo. Compartilhe o site com clientes e
              entre no painel para acompanhar a agenda.
            </p>
            {success.emailSent ? (
              <p className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-3 py-2 text-sm text-brand-gold">
                Enviamos um e-mail para {success.email} com os dois links.
              </p>
            ) : (
              <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                {success.emailError ||
                  "Não foi possível enviar o e-mail agora. Os links estão abaixo — você pode copiá-los."}
              </p>
            )}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">
                  Site para clientes agendarem
                </p>
                <a
                  href={success.siteUrl}
                  className="mt-1 block break-all text-brand-gold hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {success.siteUrl}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">
                  Painel do gestor
                </p>
                <a
                  href={success.gestorUrl}
                  className="mt-1 block break-all text-brand-gold hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {success.gestorUrl}
                </a>
              </div>
              <p className="pt-1">Login: {success.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={success.sitePath}
                className="rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-ink"
              >
                Abrir meu site
              </Link>
              <Link
                href="/gestor/login"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white"
              >
                Entrar no CRM
              </Link>
            </div>
            <p className="text-xs text-white/40">
              Dica: cadastre mais serviços em Serviços no painel. Já deixamos um
              serviço inicial para você receber o primeiro agendamento.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className="w-full max-w-lg space-y-4 rounded-[1.75rem] border border-white/10 bg-black/30 p-8"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">
              Plano FREE
            </p>
            <h1 className="font-display text-4xl text-white">
              Criar minha estética
            </h1>
            <p className="text-sm text-white/60">
              Sem cartão. Em poucos minutos você tem site + agenda.
            </p>

            <label className="block text-sm text-white/70">
              Nome da estética *
              <input
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, companyName: undefined }));
                }}
                className={inputClass(fieldErrors.companyName)}
                placeholder="Ex: Auto Detail João"
                autoComplete="organization"
              />
              <FieldError message={fieldErrors.companyName} />
            </label>

            <label className="block text-sm text-white/70">
              Endereço do site (slug) *
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-"),
                  );
                  setFieldErrors((prev) => ({ ...prev, slug: undefined }));
                }}
                className={inputClass(fieldErrors.slug)}
                autoComplete="off"
              />
              <span className="mt-1 block text-xs text-white/40">
                Seu site ficará em /s/{slug || "sua-estetica"}
              </span>
              <FieldError message={fieldErrors.slug} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-white/70">
                Seu nome *
                <input
                  value={adminName}
                  onChange={(e) => {
                    setAdminName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, adminName: undefined }));
                  }}
                  className={inputClass(fieldErrors.adminName)}
                  autoComplete="name"
                />
                <FieldError message={fieldErrors.adminName} />
              </label>
              <label className="block text-sm text-white/70">
                WhatsApp da loja
                <input
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, whatsapp: undefined }));
                  }}
                  className={inputClass(fieldErrors.whatsapp)}
                  placeholder="11999990000"
                  inputMode="tel"
                  autoComplete="tel"
                />
                <FieldError message={fieldErrors.whatsapp} />
              </label>
            </div>

            <label className="block text-sm text-white/70">
              Telefone
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                className={inputClass(fieldErrors.phone)}
                inputMode="tel"
                autoComplete="tel"
              />
              <FieldError message={fieldErrors.phone} />
            </label>

            <label className="block text-sm text-white/70">
              E-mail de acesso *
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, adminEmail: undefined }));
                }}
                className={inputClass(fieldErrors.adminEmail)}
                autoComplete="email"
              />
              <FieldError message={fieldErrors.adminEmail} />
            </label>

            <label className="block text-sm text-white/70">
              Senha * (mín. 6)
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    adminPassword: undefined,
                  }));
                }}
                className={inputClass(fieldErrors.adminPassword)}
                autoComplete="new-password"
              />
              <FieldError message={fieldErrors.adminPassword} />
            </label>

            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-gold py-3 font-semibold text-brand-ink disabled:opacity-60"
            >
              {loading ? "Criando…" : "Criar conta FREE"}
            </button>

            <p className="text-center text-xs text-white/40">
              Ao continuar, você concorda com os{" "}
              <Link href="/termos" className="text-brand-gold/80">
                Termos
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="text-brand-gold/80">
                Privacidade
              </Link>
              .
            </p>
          </form>
        )}
      </main>
      <PlatformFooter />
    </div>
  );
}
