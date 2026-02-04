import { supabase } from "./supabase";

const BUCKET_NAME = "passao-fast-food";
const PRODUCT_IMAGES_FOLDER = "product-images";

/**
 * Uploads a product image to Supabase Storage
 * @param file - The file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const allowedTypes = ["jpg", "jpeg", "png", "webp"];

  if (!fileExt || !allowedTypes.includes(fileExt)) {
    throw new Error("Tipo de archivo no permitido. Use JPG, PNG o WebP.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("El archivo excede el límite de 5MB.");
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;
  const filePath = `${PRODUCT_IMAGES_FOLDER}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
  }

  const { data: publicUrl } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}

/**
 * Deletes a product image from Supabase Storage
 * @param url - The public URL of the image to delete
 */
export async function deleteProductImage(url: string): Promise<void> {
  // Extract the file path from the public URL
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/storage/v1/object/public/");

  if (pathParts.length < 2) {
    throw new Error("URL de imagen inválida");
  }

  // Get the path after bucket name
  const fullPath = pathParts[1];
  const bucketAndPath = fullPath.split("/");
  const bucketName = bucketAndPath[0];
  const filePath = bucketAndPath.slice(1).join("/");

  if (bucketName !== BUCKET_NAME) {
    throw new Error("La imagen no pertenece al bucket correcto");
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
}
