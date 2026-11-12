import { z } from "zod";

const digits = (v: string) => v.replace(/\D/g, "");
const optionalDigits = (label: string, ok: (d: string) => boolean, msg: string) =>
  z.string().trim().transform(digits).refine((d) => d === "" || ok(d), `${label}: ${msg}`).transform((d) => d || null);

export function isValidCpf(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(cpf[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export function isValidCnpj(cnpj: string) {
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (n: number) => {
    const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const s = w.reduce((a, wi, i) => a + Number(cnpj[i]) * wi, 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

export const customerSchema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome completo.").max(160, "Nome muito longo."),
  phone: optionalDigits("Telefone", (d) => d.length >= 10 && d.length <= 13, "use DDD + número."),
  whatsapp: optionalDigits("WhatsApp", (d) => d.length >= 10 && d.length <= 13, "use DDD + número."),
  email: z.string().trim().toLowerCase().max(255).refine((v) => v === "" || z.string().email().safeParse(v).success, "E-mail inválido.").transform((v) => v || null),
  document: optionalDigits("CPF/CNPJ", (d) => (d.length === 11 ? isValidCpf(d) : d.length === 14 && isValidCnpj(d)), "número inválido."),
  organization: z.string().trim().max(160).transform((v) => v || null),
  notes: z.string().trim().max(2000, "Observações muito longas.").transform((v) => v || null),
  status: z.enum(["active", "inactive"]),
});

export type CustomerInput = z.input<typeof customerSchema>;

export function duplicateMessage(err: { code?: string; message?: string } | null) {
  if (err?.code !== "23505") return null;
  const m = err.message ?? "";
  if (m.includes("email")) return "Já existe um cliente com este e-mail.";
  if (m.includes("document")) return "Já existe um cliente com este CPF/CNPJ.";
  if (m.includes("whatsapp")) return "Já existe um cliente com este WhatsApp.";
  return "Cliente já cadastrado.";
}

export function formatPhone(d: string | null) {
  if (!d) return "—";
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}
