import { describe, it, expect } from "vitest";
import { customerSchema, duplicateMessage } from "./validation";

const base = { full_name: "Maria Souza", phone: "", whatsapp: "", email: "", document: "", organization: "", notes: "", status: "active" as const };

describe("cadastro de cliente", () => {
  it("exige nome completo", () => expect(customerSchema.safeParse({ ...base, full_name: "A" }).success).toBe(false));
  it("rejeita e-mail inválido", () => expect(customerSchema.safeParse({ ...base, email: "x@" }).success).toBe(false));
  it("rejeita CPF inválido", () => expect(customerSchema.safeParse({ ...base, document: "111.111.111-11" }).success).toBe(false));
  it("aceita CPF válido e guarda só dígitos", () => expect(customerSchema.parse({ ...base, document: "529.982.247-25" }).document).toBe("52998224725"));
  it("aceita CNPJ válido", () => expect(customerSchema.safeParse({ ...base, document: "11.222.333/0001-81" }).success).toBe(true));
  it("rejeita telefone sem DDD", () => expect(customerSchema.safeParse({ ...base, phone: "98765-4321" }).success).toBe(false));
  it("traduz duplicidade de e-mail", () => expect(duplicateMessage({ code: "23505", message: "customers_company_email_uq" })).toBe("Já existe um cliente com este e-mail."));
});
