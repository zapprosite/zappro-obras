import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ObraUpdate = Database["public"]["Tables"]["obras"]["Update"];

export async function updateObra(obraId: string, data: ObraUpdate) {
  const { data: result, error } = await supabase
    .from("obras")
    .update(data)
    .eq("id", obraId)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteObra(obraId: string) {
  const { error } = await supabase
    .from("obras")
    .update({ deleted: true })
    .eq("id", obraId);

  if (error) throw error;
}
