import { createClient, SupabaseClient } from "@supabase/supabase-js"

export class StorageService {
  private supabase: SupabaseClient

  constructor(url: string, key: string) {
    this.supabase = createClient(url, key)
  }

  async uploadImage(buffer: Uint8Array, filename: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from("meme-images")
      .upload(filename, buffer, {
        contentType: "image/png",
        upsert: true,
      })

    if (error) {
      console.error("[Storage] Upload failed:", error)
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = this.supabase.storage.from("meme-images").getPublicUrl(data.path)

    console.log("[Storage] Image uploaded:", publicUrl)
    return publicUrl
  }

  /**
   * Delete an image from storage
   */
  async deleteImage(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from("meme-images")
      .remove([path])

    if (error) {
      console.error("[Storage] Delete failed:", error)
      throw error
    }

    console.log("[Storage] Image deleted:", path)
  }
}
