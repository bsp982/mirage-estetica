import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "gallery");
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

async function saveUpload(
  companyId: string,
  file: File,
  kind: "before" | "after",
): Promise<string> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Use JPG, PNG ou WebP");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem deve ter no máximo 5MB");
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const dir = path.join(UPLOAD_ROOT, companyId);
  await fs.mkdir(dir, { recursive: true });
  const name = `${kind}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const full = path.join(dir, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(full, buffer);
  return `/uploads/gallery/${companyId}/${name}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const items = await prisma.galleryItem.findMany({
    where: { companyId: session.companyId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const before = form.get("before");
    const after = form.get("after");
    const description = String(form.get("description") ?? "").trim() || null;
    const vehicleLabel = String(form.get("vehicleLabel") ?? "").trim() || null;

    if (!(before instanceof File) || !(after instanceof File)) {
      return NextResponse.json(
        { error: "Envie as duas imagens: antes (sujo) e depois (limpo)" },
        { status: 400 },
      );
    }
    if (!before.size || !after.size) {
      return NextResponse.json(
        { error: "As duas imagens são obrigatórias" },
        { status: 400 },
      );
    }

    const beforeUrl = await saveUpload(session.companyId, before, "before");
    const afterUrl = await saveUpload(session.companyId, after, "after");

    const count = await prisma.galleryItem.count({
      where: { companyId: session.companyId },
    });

    const item = await prisma.galleryItem.create({
      data: {
        companyId: session.companyId,
        beforeUrl,
        afterUrl,
        description,
        vehicleLabel,
        date: new Date(),
        sortOrder: count,
        active: true,
      },
    });

    // Garante que a galeria aparece no site
    await prisma.companySettings.updateMany({
      where: { companyId: session.companyId },
      data: { showGallery: true },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao enviar imagens";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const item = await prisma.galleryItem.findFirst({
    where: { id, companyId: session.companyId },
  });
  if (!item) {
    return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  }

  await prisma.galleryItem.delete({ where: { id } });

  for (const url of [item.beforeUrl, item.afterUrl]) {
    if (url.startsWith("/uploads/gallery/")) {
      const full = path.join(process.cwd(), "public", url.replace(/^\//, ""));
      await fs.unlink(full).catch(() => undefined);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: string;
    active?: boolean;
    description?: string | null;
    vehicleLabel?: string | null;
  };

  const existing = await prisma.galleryItem.findFirst({
    where: { id: body.id, companyId: session.companyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  }

  const item = await prisma.galleryItem.update({
    where: { id: body.id },
    data: {
      active: body.active ?? existing.active,
      description:
        body.description !== undefined ? body.description : existing.description,
      vehicleLabel:
        body.vehicleLabel !== undefined
          ? body.vehicleLabel
          : existing.vehicleLabel,
    },
  });

  return NextResponse.json({ item });
}
